const { ipcMain } = require('electron')
const store = require('./common/store')
const logger = require('./common/logger')
const ipcMainEvents = require('./common/ipc-main-events')
const { kuboApiPost } = require('./common/kubo-rpc')
const { STATUS } = require('./daemon/consts')
const getCtx = require('./context')

// Override kubo's default Provide.Strategy ("all", which announces every
// stored block) with a smaller subset suited to desktop nodes. The named
// strategies below use kubo's "+unique" bloom-deduplicated modes:
// "pinned+mfs+unique" is kubo's recommended desktop default and announces
// pins plus MFS; "pinned+unique" announces pins only. See:
// https://github.com/ipfs/kubo/blob/master/docs/config.md#providestrategy
//
// Each named strategy also writes an explicit Import.FastProvide* triple:
// - FastProvideRoot=true announces every newly-added or pinned root
//   immediately. Kubo's current default; set explicitly so a future kubo
//   change cannot silently weaken the guarantee.
// - FastProvideDAG=true walks the full DAG on add or pin, so a non-"all"
//   strategy still announces new content right away instead of waiting
//   for the next reprovide cycle.
// - FastProvideWait=false keeps add and pin commands non-blocking; the
//   provide runs in the background.
const FAST_PROVIDE_TRIPLE = {
  FastProvideRoot: true,
  FastProvideDAG: true,
  FastProvideWait: false
}

const STRATEGIES = {
  'pinned+mfs+unique': {
    Strategy: 'pinned+mfs+unique',
    Import: { ...FAST_PROVIDE_TRIPLE }
  },
  'pinned+unique': {
    Strategy: 'pinned+unique',
    Import: { ...FAST_PROVIDE_TRIPLE }
  }
}

// Union of Import.* keys provide-strategy owns. Detection projects Import
// to these keys only, so unrelated Import.* fields (cid-profile settings,
// future kubo schema additions) cannot trigger 'manual'.
const STRATEGY_IMPORT_KEYS = new Set(
  Object.values(STRATEGIES).flatMap(s => Object.keys(s.Import))
)

async function fetchProvideStrategy (ipfsd) {
  const raw = await kuboApiPost(ipfsd, '/api/v0/config?arg=Provide.Strategy')
  const parsed = JSON.parse(raw)
  // Kubo returns null/empty for an unset optionalString.
  return parsed.Value || ''
}

async function fetchImportConfig (ipfsd) {
  const raw = await kuboApiPost(ipfsd, '/api/v0/config?arg=Import')
  const parsed = JSON.parse(raw)
  return parsed.Value || {}
}

function matchesImport (knownImport, profileImport) {
  for (const key of Object.keys(profileImport)) {
    if (knownImport[key] !== profileImport[key]) return false
  }
  return true
}

function detectCurrentStrategy (provideStrategy, importSection) {
  // Project Import to provide-strategy keys; unrelated keys stay invisible
  // so they cannot flip the state to 'manual' on their own.
  const known = {}
  for (const key of STRATEGY_IMPORT_KEYS) {
    known[key] = importSection?.[key] ?? null
  }

  const strategyEmpty = !provideStrategy
  const fastProvideAllNull = Object.values(known).every(v => v === null)

  // Strategy unset and every FastProvide* null: pristine, just-cleared, or
  // only unrelated fields edited. Show "Default".
  if (strategyEmpty && fastProvideAllNull) return 'default'

  for (const [name, profile] of Object.entries(STRATEGIES)) {
    if (provideStrategy === profile.Strategy && matchesImport(known, profile.Import)) {
      return name
    }
  }

  // The live config matches no known profile. Show read-only "Manual" so
  // a tray click cannot overwrite the user's hand-tuned settings.
  return 'manual'
}

async function applyProvideStrategy (ipfsd, name) {
  let step = 'init'
  try {
    // Write Provide.Strategy as an individual field to leave the rest of
    // the Provide section (DHT tuning, BloomFPRate) untouched.
    step = 'provide write'
    const strategyValue = name === 'default' ? null : STRATEGIES[name].Strategy
    const encodedStrategy = encodeURIComponent(JSON.stringify(strategyValue))
    await kuboApiPost(ipfsd, `/api/v0/config?arg=Provide.Strategy&arg=${encodedStrategy}&json=true`)

    // Read-merge-write Import so we touch only the FastProvide* triple and
    // preserve foreign Import.* keys (cid-profile's UnixFS settings,
    // hand-set values, future kubo additions). "Default" nulls our keys,
    // leaving Kubo to apply its built-ins.
    step = 'import write'
    const existing = await fetchImportConfig(ipfsd)
    const merged = { ...existing }
    for (const key of STRATEGY_IMPORT_KEYS) merged[key] = null
    if (name !== 'default') Object.assign(merged, STRATEGIES[name].Import)
    const encodedImport = encodeURIComponent(JSON.stringify(merged))
    await kuboApiPost(ipfsd, `/api/v0/config?arg=Import&arg=${encodedImport}&json=true`)

    // Persist, then restart the daemon. Kubo clears the provide queue on a
    // Provide.Strategy change at startup, so the new strategy takes effect
    // cleanly without an explicit `ipfs provide clear`.
    step = 'persist'
    await store.safeSet('provideStrategy', name, () => {
      ipcMain.emit(ipcMainEvents.IPFS_CONFIG_CHANGED)
    })

    logger.info(`[provide-strategy] applied '${name}'`)
  } catch (err) {
    logger.error(`[provide-strategy] ${step} failed for '${name}': ${err.message}`)
  }
}

module.exports = async function setupProvideStrategy () {
  const getIpfsd = getCtx().getFn('getIpfsd')

  ipcMain.on('provideStrategy.select', async (_, name) => {
    if (name !== 'default' && !STRATEGIES[name]) {
      logger.error(`[provide-strategy] unknown strategy: ${name}`)
      return
    }
    const ipfsd = await getIpfsd(true)
    if (!ipfsd) {
      logger.error('[provide-strategy] cannot apply strategy: daemon not running')
      return
    }
    await applyProvideStrategy(ipfsd, name)
  })

  ipcMain.on(ipcMainEvents.IPFSD, async (status) => {
    if (status !== STATUS.STARTING_FINISHED) return

    const ipfsd = await getIpfsd(true)
    if (!ipfsd) return

    // The user may edit ~/.ipfs/config directly between runs, so the
    // stored provideStrategy is a hint, not the source of truth. Read the
    // live Provide.Strategy and Import.FastProvide*, classify, and update
    // the store on drift. CONFIG_UPDATED then triggers a tray rebuild so
    // the radio matches the live config (flipping to "Manual" when needed).
    try {
      const [provideStrategy, importSection] = await Promise.all([
        fetchProvideStrategy(ipfsd),
        fetchImportConfig(ipfsd)
      ])
      const detected = detectCurrentStrategy(provideStrategy, importSection)
      const stored = store.get('provideStrategy', 'default')

      if (detected !== stored) {
        logger.info(`[provide-strategy] reconciled '${stored}' -> '${detected}' from live config`)
        store.safeSet('provideStrategy', detected)
        ipcMain.emit(ipcMainEvents.CONFIG_UPDATED)
      }
    } catch (err) {
      logger.error(`[provide-strategy] reconcile failed: ${err.message}`)
    }
  })

  logger.info(`[provide-strategy] active: ${store.get('provideStrategy', 'default')}`)
}

module.exports.detectCurrentStrategy = detectCurrentStrategy
