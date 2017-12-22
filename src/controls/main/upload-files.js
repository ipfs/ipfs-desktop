import {ipcMain} from 'electron'
import {uploadFiles} from '../utils'

export default function (opts) {
  ipcMain.on('drop-files', uploadFiles(opts))
  opts.menubar.tray.on('drop-files', uploadFiles(opts))
}
