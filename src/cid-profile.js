const { ipcMain } = require('electron')
const http = require('http')
const store = require('./common/store')
const logger = require('./common/logger')
const ipcMainEvents = require('./common/ipc-main-events')
const { STATUS } = require('./daemon/consts')
const getCtx = require('./context')

// Meaning of "Default" when Import.* is empty. Sets the cid-version passed
// to `files/chcid` on a Default selection. Our chosen fallback, not Kubo's
// built-in default. Change this literal to flip the meaning of "Default"
// in a future release.
const DEFAULT_PROFILE = 'unixfs-v0-2015'

const PROFILES = {
  'unixfs-v1-2025': {
    Import: {
      CidVersion: 1,
      UnixFSRawLeaves: true,
      UnixFSChunker: 'size-1048576',
      HashFunction: 'sha2-256',
      UnixFSFileMaxLinks: 1024,
      UnixFSDirectoryMaxLinks: 0,
      UnixFSHAMTDirectoryMaxFanout: 256,
      UnixFSHAMTDirectorySizeThreshold: '256KiB',
      UnixFSHAMTDirectorySizeEstimation: 'block',
      UnixFSDAGLayout: 'balanced'
    },
    chcidVersion: 1
  },
  'unixfs-v0-2015': {
    Import: {
      CidVersion: 0,
      UnixFSRawLeaves: false,
      UnixFSChunker: 'size-262144',
      HashFunction: 'sha2-256',
      UnixFSFileMaxLinks: 174,
      UnixFSDirectoryMaxLinks: 0,
      UnixFSHAMTDirectoryMaxFanout: 256,
      UnixFSHAMTDirectorySizeThreshold: '256KiB',
      UnixFSHAMTDirectorySizeEstimation: 'links',
      UnixFSDAGLayout: 'balanced'
    },
    chcidVersion: 0
  }
}

const DEFAULT_CHCID_VERSION = PROFILES[DEFAULT_PROFILE].chcidVersion

// TODO: drop this raw HTTP helper once the project switches to
// kubo-rpc-client. The client exposes config.get / config.set / files.chcid
// and handles auth headers, query encoding, and IPv6 for us.
function kuboApiPost (ipfsd, apiPath) {
  return new Promise((resolve, reject) => {
    const { address, port } = ipfsd.apiAddr.nodeAddress()

    const req = http.request({
      method: 'POST',
      hostname: address,
      port,
      path: apiPath,
      timeout: 30000
    }, (res) => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data)
        } else {
          reject(new Error(`kubo API ${apiPath} returned status ${res.statusCode}: ${data}`))
        }
      })
    })

    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error(`kubo API ${apiPath} request timed out`))
    })
    req.end()
  })
}

async function fetchImportConfig (ipfsd) {
  const raw = await kuboApiPost(ipfsd, '/api/v0/config?arg=Import')
  const parsed = JSON.parse(raw)
  return parsed.Value
}

function matchesProfile (importSection, profileImport) {
  const profileKeys = Object.keys(profileImport)

  // Every profile key must match
  for (const key of profileKeys) {
    if (importSection[key] !== profileImport[key]) return false
  }

  // Kubo serializes unset schema fields as null. Tolerating extra null keys
  // keeps a profile matching after Kubo adds new Import.* fields in a future
  // release. A non-null extra means the user set something unknown to us,
  // so treat the config as manual.
  for (const key of Object.keys(importSection)) {
    if (!profileKeys.includes(key) && importSection[key] !== null) return false
  }

  return true
}

function detectCurrentProfile (importSection) {
  // Missing or empty Import section: pristine, never customized.
  if (!importSection || Object.keys(importSection).length === 0) return 'default'
  // After applyCidProfile('default') writes `Import = {}`, Kubo echoes the
  // section back with every schema field as null. This early-return keeps
  // that state classified as 'default'; without it, matchesProfile rejects
  // the null entries (null !== 1, null !== 'size-1048576') and the next
  // daemon start misclassifies the state as 'manual'.
  if (Object.values(importSection).every(v => v === null)) return 'default'

  for (const [name, profile] of Object.entries(PROFILES)) {
    if (matchesProfile(importSection, profile.Import)) return name
  }

  // A populated Import.* that matches no profile means the user edited the
  // config by hand. Surface it as a read-only "Manual" state so we keep
  // their edits intact.
  return 'manual'
}

async function applyCidProfile (ipfsd, profileName) {
  logger.info(`[cid-profile] applying profile: ${profileName}`)

  try {
    // Write Import.* through the RPC API rather than the config file, so we
    // never race with Kubo's own config writer. Selecting "Default" clears
    // the section; Kubo then applies its built-ins.
    const importValue = profileName === 'default'
      ? {}
      : { ...PROFILES[profileName].Import }
    const encodedValue = encodeURIComponent(JSON.stringify(importValue))
    await kuboApiPost(ipfsd, `/api/v0/config?arg=Import&arg=${encodedValue}&json=true`)

    // chcid re-hashes the MFS root under the new CID version. It takes
    // effect live (no daemon restart) but requires a running daemon, so
    // we call it here rather than in the reconcile path.
    const cidVersion = profileName === 'default'
      ? DEFAULT_CHCID_VERSION
      : PROFILES[profileName].chcidVersion
    await kuboApiPost(ipfsd, `/api/v0/files/chcid?arg=/&cid-version=${cidVersion}`)
    logger.info(`[cid-profile] chcid completed for cid-version=${cidVersion}`)

    // Persist, then restart the daemon so the embedded WebUI re-reads the
    // config and shows the new CID version in Files and Settings.
    await store.safeSet('cidProfile', profileName, () => {
      ipcMain.emit(ipcMainEvents.IPFS_CONFIG_CHANGED)
    })
  } catch (err) {
    logger.error(`[cid-profile] error applying profile: ${err.message}`)
  }
}

module.exports = async function setupCidProfile () {
  const getIpfsd = getCtx().getFn('getIpfsd')

  ipcMain.on('cidProfile.select', async (_, profileName) => {
    if (profileName !== 'default' && !PROFILES[profileName]) {
      logger.error(`[cid-profile] unknown profile: ${profileName}`)
      return
    }
    const ipfsd = await getIpfsd(true)
    if (!ipfsd) {
      logger.error('[cid-profile] cannot apply profile: daemon not running')
      return
    }
    await applyCidProfile(ipfsd, profileName)
  })

  ipcMain.on(ipcMainEvents.IPFSD, async (status) => {
    if (status !== STATUS.STARTING_FINISHED) return

    const ipfsd = await getIpfsd(true)
    if (!ipfsd) return

    // The user may edit ~/.ipfs/config directly between runs, so the stored
    // cidProfile is a hint rather than the source of truth. Read the live
    // Import.* section, classify it, and update the store on drift.
    // CONFIG_UPDATED then nudges the tray to rebuild so the radio reflects
    // reality (including flipping to the read-only "Manual" item).
    try {
      const importSection = await fetchImportConfig(ipfsd)
      const detected = detectCurrentProfile(importSection)
      const stored = store.get('cidProfile', 'default')

      if (detected !== stored) {
        logger.info(`[cid-profile] detected profile '${detected}' differs from stored '${stored}', updating`)
        store.safeSet('cidProfile', detected)
        ipcMain.emit(ipcMainEvents.CONFIG_UPDATED)
      }
    } catch (err) {
      logger.error(`[cid-profile] error detecting profile: ${err.message}`)
    }
  })

  logger.info('[cid-profile] initialized')
}

module.exports.detectCurrentProfile = detectCurrentProfile
