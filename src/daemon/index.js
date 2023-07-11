const { app, ipcMain } = require('electron')
const fs = require('fs-extra')
const { join } = require('path')
const { ipfsNotRunningDialog } = require('../dialogs')
const store = require('../common/store')
const logger = require('../common/logger')
const { STATUS } = require('./consts')
const createDaemon = require('./daemon')
const ipcMainEvents = require('../common/ipc-main-events')
const { analyticsKeys } = require('../analytics/keys')

async function setupDaemon (ctx) {
  let ipfsd = null
  let status = null
  let wasOnline = null

  const updateStatus = (stat, id = null) => {
    status = stat
    ipcMain.emit(ipcMainEvents.IPFSD, status, id)
  }

  const getIpfsd = async (optional = false) => {
    if (optional) {
      return ipfsd
    }

    if (!ipfsd) {
      await ipfsNotRunningDialog(ctx)
    }

    return ipfsd
  }

  const runAndStatus = (fn) => async () => {
    await fn()
    return status
  }

  const startIpfs = async () => {
    if (ipfsd) {
      return
    }

    const log = logger.start('[ipfsd] start daemon', { withAnalytics: analyticsKeys.DAEMON_START })
    const config = store.get('ipfsConfig')
    updateStatus(STATUS.STARTING_STARTED)

    const res = await createDaemon(config)

    if (res.err) {
      log.fail(res.err)
      updateStatus(STATUS.STARTING_FAILED)
      return
    }

    ipfsd = res.ipfsd

    logger.info(`[daemon] IPFS_PATH: ${ipfsd.path}`)
    logger.info(`[daemon] PeerID:    ${res.id}`)

    // Update the path if it was blank previously.
    // This way we use the default path when it is
    // not set.
    if (!config.path || typeof config.path !== 'string') {
      config.path = ipfsd.path
      store.set('ipfsConfig', config)
    }

    log.end()
    updateStatus(STATUS.STARTING_FINISHED, res.id)
  }

  const stopIpfs = async () => {
    if (!ipfsd) {
      return
    }

    const log = logger.start('[ipfsd] stop daemon', { withAnalytics: analyticsKeys.DAEMON_STOP })
    updateStatus(STATUS.STOPPING_STARTED)

    if (!fs.pathExistsSync(join(ipfsd.path, 'config'))) {
      // Is remote api... ignore
      ipfsd = null
      updateStatus(STATUS.STOPPING_FINISHED)
      return
    }

    try {
      await ipfsd.stop()
      log.end()
      updateStatus(STATUS.STOPPING_FINISHED)
    } catch (err) {
      logger.error(`[ipfsd] ${err.toString()}`)
      updateStatus(STATUS.STOPPING_FAILED)
    } finally {
      ipfsd = null
    }
  }

  const restartIpfs = async () => {
    await stopIpfs()
    await startIpfs()
  }

  ctx.startIpfs = runAndStatus(startIpfs)
  ctx.stopIpfs = runAndStatus(stopIpfs)
  ctx.restartIpfs = runAndStatus(restartIpfs)
  ctx.getIpfsd = getIpfsd

  ipcMain.on(ipcMainEvents.IPFS_CONFIG_CHANGED, restartIpfs)

  app.on('before-quit', async () => {
    if (ipfsd) await stopIpfs()
  })

  await startIpfs()

  ipcMain.on(ipcMainEvents.ONLINE_STATUS_CHANGED, (_, isOnline) => {
    if (wasOnline === false && isOnline && ipfsd) {
      restartIpfs()
    }

    wasOnline = isOnline
  })
}

module.exports = setupDaemon
module.exports.STATUS = STATUS
