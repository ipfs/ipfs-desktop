const { ipcMain } = require('electron')
const store = require('./common/store')
const logger = require('./common/logger')
const ipcMainEvents = require('./common/ipc-main-events')
const { kuboApiPost } = require('./common/kubo-rpc')
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
    }
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
    }
  }
}

const DEFAULT_CHCID_VERSION = PROFILES[DEFAULT_PROFILE].Import.CidVersion

async function fetchImportConfig (ipfsd) {
  const raw = await kuboApiPost(ipfsd, '/api/v0/config?arg=Import')
  const parsed = JSON.parse(raw)
  return parsed.Value || {}
}

// Union of Import.* keys cid-profile owns. Detection projects Import to
// these keys only, so unrelated Import.* fields (future kubo schema
// additions, another module's keys like provide-strategy's FastProvide*)
// cannot trigger 'manual'.
const PROFILE_KEYS = new Set(
  Object.values(PROFILES).flatMap(p => Object.keys(p.Import))
)

function matchesProfile (knownImport, profileImport) {
  for (const key of Object.keys(profileImport)) {
    if (knownImport[key] !== profileImport[key]) return false
  }
  return true
}

function detectCurrentProfile (importSection) {
  // Project to the cid-profile keyset. Missing keys become null so partial
  // sections behave the same as fully-serialized ones.
  const known = {}
  for (const key of PROFILE_KEYS) {
    known[key] = importSection?.[key] ?? null
  }

  // Every cid-profile key is null: pristine, just-cleared, or only
  // unrelated Import.* fields edited. Show "Default".
  if (Object.values(known).every(v => v === null)) return 'default'

  for (const [name, profile] of Object.entries(PROFILES)) {
    if (matchesProfile(known, profile.Import)) return name
  }

  // At least one cid-profile key has a non-null value matching no known
  // profile. The user hand-tuned cid-relevant settings; show "Manual"
  // (read-only) so a tray click cannot overwrite them.
  return 'manual'
}

async function applyCidProfile (ipfsd, profileName) {
  let step = 'init'
  try {
    // Write Import.* through the RPC API rather than the config file to
    // avoid racing with Kubo's own config writer. Read-merge-write so we
    // touch only the cid-profile keyset and preserve foreign Import.*
    // fields (provide-strategy's FastProvide*, hand-set values, future
    // kubo additions). "Default" nulls our keys, leaving Kubo to apply
    // its built-ins.
    step = 'config write'
    const existing = await fetchImportConfig(ipfsd)
    const merged = { ...existing }
    for (const key of PROFILE_KEYS) merged[key] = null
    if (profileName !== 'default') Object.assign(merged, PROFILES[profileName].Import)
    const encodedValue = encodeURIComponent(JSON.stringify(merged))
    await kuboApiPost(ipfsd, `/api/v0/config?arg=Import&arg=${encodedValue}&json=true`)

    // chcid re-hashes the MFS root under the new CID version. It takes
    // effect live (no daemon restart) but requires a running daemon, so
    // we call it here rather than in the reconcile path.
    step = 'chcid'
    const cidVersion = profileName === 'default'
      ? DEFAULT_CHCID_VERSION
      : PROFILES[profileName].Import.CidVersion
    await kuboApiPost(ipfsd, `/api/v0/files/chcid?arg=/&cid-version=${cidVersion}`)

    // Persist, then restart the daemon so the embedded WebUI re-reads the
    // config and shows the new CID version in Files and Settings.
    step = 'persist'
    await store.safeSet('cidProfile', profileName, () => {
      ipcMain.emit(ipcMainEvents.IPFS_CONFIG_CHANGED)
    })

    logger.info(`[cid-profile] applied '${profileName}' (cid-version=${cidVersion})`)
  } catch (err) {
    logger.error(`[cid-profile] ${step} failed for '${profileName}': ${err.message}`)
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

    // The user may edit ~/.ipfs/config directly between runs, so the
    // stored cidProfile is a hint, not the source of truth. Read the live
    // Import.* section, classify, and update the store on drift.
    // CONFIG_UPDATED then triggers a tray rebuild so the radio matches the
    // live config (flipping to "Manual" when needed).
    try {
      const importSection = await fetchImportConfig(ipfsd)
      const detected = detectCurrentProfile(importSection)
      const stored = store.get('cidProfile', 'default')

      if (detected !== stored) {
        logger.info(`[cid-profile] reconciled '${stored}' -> '${detected}' from live config`)
        store.safeSet('cidProfile', detected)
        ipcMain.emit(ipcMainEvents.CONFIG_UPDATED)
      }
    } catch (err) {
      logger.error(`[cid-profile] reconcile failed: ${err.message}`)
    }
  })

  logger.info(`[cid-profile] active: ${store.get('cidProfile', 'default')}`)
}

module.exports.detectCurrentProfile = detectCurrentProfile
