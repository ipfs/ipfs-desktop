import { ipcMain, app, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import { STATUS } from '../late/register-daemon'

// adapted from https://github.com/electron-userland/electron-builder/issues/1604#issuecomment-372091881
export default function quitAndInstall () {
  app.removeAllListeners('window-all-closed')
  const browserWindows = BrowserWindow.getAllWindows()
  browserWindows.forEach(function (browserWindow) {
    browserWindow.removeAllListeners('close')
  })

  ipcMain.on('ipfsd', status => {
    if (status === STATUS.STOPPING_FAILED || status === STATUS.STOPPING_FINISHED) {
      autoUpdater.quitAndInstall(true, true)
    }
  })

  ipcMain.emit('stopIpfs')
}
