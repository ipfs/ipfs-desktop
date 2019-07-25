import { app, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import { STATUS } from '../daemon'

// adapted from https://github.com/electron-userland/electron-builder/issues/1604#issuecomment-372091881
export default async function quitAndInstall ({ stopIpfs }) {
  app.removeAllListeners('window-all-closed')
  const browserWindows = BrowserWindow.getAllWindows()
  browserWindows.forEach(function (browserWindow) {
    browserWindow.removeAllListeners('close')
  })

  const status = await stopIpfs()

  if (status === STATUS.STOPPING_FAILED || status === STATUS.STOPPING_FINISHED) {
    autoUpdater.quitAndInstall(true, true)
  }
}
