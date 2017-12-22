import {join} from 'path'
import {shell, ipcMain} from 'electron'

export default function (opts) {
  ipcMain.on('open-settings', () => {
    shell.openExternal(join(opts.ipfsPath, 'config'))
  })
}
