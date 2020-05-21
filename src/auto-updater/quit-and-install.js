const { app, BrowserWindow } = require('electron')
const { autoUpdater } = require('electron-updater')
const logger = require('../common/logger')

// adapted from https://github.com/electron-userland/electron-builder/issues/1604#issuecomment-372091881
module.exports = async function quitAndInstall ({ stopIpfs }) {
  app.removeAllListeners('window-all-closed')
  const browserWindows = BrowserWindow.getAllWindows()
  browserWindows.forEach(function (browserWindow) {
    browserWindow.removeAllListeners('close')
  })

  try {
    const status = await stopIpfs()
    logger.info(`[quit-and-install] stopIpfs had finished with status: ${status}`)
  } catch (err) {
    logger.error('[quit-and-install] stopIpfs had an error', err)
  }

  autoUpdater.quitAndInstall(true, true)
}
