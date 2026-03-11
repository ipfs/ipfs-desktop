const { ipcMain } = require('electron')
const http = require('http')
const store = require('./common/store')
const logger = require('./common/logger')
const ipcMainEvents = require('./common/ipc-main-events')
const { STATUS } = require('./daemon/consts')
const getCtx = require('./context')

// Change this to 'unixfs-v1-2025' to switch what "Default" means.
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

  // Any extra keys in the config must be null (kubo-added defaults)
  for (const key of Object.keys(importSection)) {
    if (!profileKeys.includes(key) && importSection[key] !== null) return false
  }

  return true
}

function detectCurrentProfile (importSection) {
  // No Import section, empty, or all-null values = kubo defaults
  if (!importSection || Object.keys(importSection).length === 0) return 'default'
  if (Object.values(importSection).every(v => v === null)) return 'default'

  for (const [name, profile] of Object.entries(PROFILES)) {
    if (matchesProfile(importSection, profile.Import)) return name
  }

  return 'manual'
}

async function applyCidProfile (ipfsd, profileName) {
  logger.info(`[cid-profile] applying profile: ${profileName}`)

  try {
    // Set Import config via kubo API (no file write, no race condition)
    const importValue = profileName === 'default'
      ? {}
      : { ...PROFILES[profileName].Import }
    const encodedValue = encodeURIComponent(JSON.stringify(importValue))
    await kuboApiPost(ipfsd, `/api/v0/config?arg=Import&arg=${encodedValue}&json=true`)

    // Update MFS root CID version (takes effect immediately, no restart needed)
    const cidVersion = profileName === 'default'
      ? DEFAULT_CHCID_VERSION
      : PROFILES[profileName].chcidVersion
    await kuboApiPost(ipfsd, `/api/v0/files/chcid?arg=/&cid-version=${cidVersion}`)
    logger.info(`[cid-profile] chcid completed for cid-version=${cidVersion}`)

    await store.safeSet('cidProfile', profileName, () => {
      ipcMain.emit(ipcMainEvents.IPFS_CONFIG_CHANGED) // restart daemon so WebUI refreshes
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

    // Reconcile stored profile with actual config on every daemon start
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
