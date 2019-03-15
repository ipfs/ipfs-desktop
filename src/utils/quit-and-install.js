import { app, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'

// adapted from https://github.com/electron-userland/electron-builder/issues/1604#issuecomment-372091881
export default function quitAndInstall () {
  app.removeAllListeners('window-all-closed')
  const browserWindows = BrowserWindow.getAllWindows()
  browserWindows.forEach(function (browserWindow) {
    browserWindow.removeAllListeners('close')
  })
  autoUpdater.quitAndInstall(true, true)
}
