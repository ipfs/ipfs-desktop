const { ipcMain } = require('electron')
const store = require('./common/store')
const logger = require('./common/logger')
const ipcMainEvents = require('./common/ipc-main-events')
const { kuboApiPost } = require('./common/kubo-rpc')
const { STATUS } = require('./daemon/consts')
const getCtx = require('./context')

// Override kubo's default Provide.Strategy ("all", which announces every
// stored block) with a smaller subset suited to desktop nodes. Both named
// strategies use kubo's "+unique" bloom-deduplicated modes:
// "pinned+mfs+unique" is kubo's recommended desktop default and announces
// pins plus MFS; "pinned+unique" announces pins only. See:
// https://github.com/ipfs/kubo/blob/master/docs/config.md#providestrategy
//
// Provide.Strategy alone decides which entry is active. The Import.* section
// says nothing about it: FastProvide* are import-time knobs IPFS Desktop
// writes once per repo (see daemon/config.js), not part of the strategy.
const STRATEGIES = ['pinned+mfs+unique', 'pinned+unique']

async function fetchProvideStrategy (ipfsd) {
  const raw = await kuboApiPost(ipfsd, '/api/v0/config?arg=Provide.Strategy')
  const parsed = JSON.parse(raw)
  // Kubo returns null/empty for an unset optionalString.
  return parsed.Value || ''
}

function detectCurrentStrategy (provideStrategy) {
  // Unset, so kubo's own built-in is in effect. Show "Default".
  if (!provideStrategy) return 'default'

  if (STRATEGIES.includes(provideStrategy)) return provideStrategy

  // Some other strategy, so the user picked it by hand. Show read-only
  // "Manual" to keep a tray click from overwriting it.
  return 'manual'
}

async function applyProvideStrategy (ipfsd, name) {
  let step = 'init'
  try {
    // Write Provide.Strategy as an individual field to leave the rest of
    // the Provide section (DHT tuning, BloomFPRate) untouched. "Default"
    // nulls it, leaving Kubo to apply its built-in.
    step = 'provide write'
    const strategyValue = name === 'default' ? null : name
    const encodedStrategy = encodeURIComponent(JSON.stringify(strategyValue))
    await kuboApiPost(ipfsd, `/api/v0/config?arg=Provide.Strategy&arg=${encodedStrategy}&json=true`)

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
    if (name !== 'default' && !STRATEGIES.includes(name)) {
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
    // live Provide.Strategy, classify, and update the store on drift.
    // CONFIG_UPDATED then triggers a tray rebuild so the radio matches the
    // live config (flipping to "Manual" when needed).
    try {
      const provideStrategy = await fetchProvideStrategy(ipfsd)
      const detected = detectCurrentStrategy(provideStrategy)
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
