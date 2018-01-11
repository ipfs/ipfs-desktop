import {shell, ipcMain} from 'electron'

export default function (opts) {
  ipcMain.on('open-url', (event, url) => {
    shell.openExternal(url)
  })
}
