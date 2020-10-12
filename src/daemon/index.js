const { app, ipcMain } = require('electron')
const fs = require('fs-extra')
const { join } = require('path')
const { ipfsNotRunningDialog } = require('../dialogs')
const store = require('../common/store')
const logger = require('../common/logger')
const { STATUS } = require('./consts')
const createDaemon = require('./daemon')

module.exports = async function (ctx) {
  let ipfsd = null
  let status = null
  let wasOnline = null

  const updateStatus = (stat) => {
    status = stat
    ipcMain.emit('ipfsd', status)
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

    const log = logger.start('[ipfsd] start daemon', { withAnalytics: 'DAEMON_START' })
    const config = store.get('ipfsConfig')
    updateStatus(STATUS.STARTING_STARTED)

    if (config.path) {
      // Updates the IPFS_PATH file. We do this every time we start up
      // to make sure we always have that file present, even though
      // there are installations and updates that might remove the file.
      writeIpfsPath(config.path)
    }

    try {
      ipfsd = await createDaemon(config)

      // Update the path if it was blank previously.
      // This way we use the default path when it is
      // not set.
      if (!config.path || typeof config.path !== 'string') {
        config.path = ipfsd.path
        store.set('ipfsConfig', config)
        writeIpfsPath(config.path)
      }

      log.end()
      updateStatus(STATUS.STARTING_FINISHED)
    } catch (err) {
      log.fail(err)
      updateStatus(STATUS.STARTING_FAILED)
    }
  }

  const stopIpfs = async () => {
    if (!ipfsd) {
      return
    }

    const log = logger.start('[ipfsd] stop daemon', { withAnalytics: 'DAEMON_STOP' })
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

  ipcMain.on('ipfsConfigChanged', restartIpfs)

  app.on('before-quit', async () => {
    if (ipfsd) await stopIpfs()
  })

  await startIpfs()

  ipcMain.on('online-status-changed', (_, isOnline) => {
    if (wasOnline === false && isOnline && ipfsd) {
      restartIpfs()
    }

    wasOnline = isOnline
  })
}

module.exports.STATUS = STATUS

function writeIpfsPath (path) {
  fs.outputFileSync(
    join(app.getPath('home'), './.ipfs-desktop/IPFS_PATH')
      .replace('app.asar', 'app.asar.unpacked'),
    path
  )
}
