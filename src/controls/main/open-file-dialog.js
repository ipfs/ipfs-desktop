import {dialog, ipcMain} from 'electron'
import {uploadFiles} from '../utils'

function openFileDialog (opts, dir = false) {
  let window = opts.window

  return (event, callback) => {
    dialog.showOpenDialog(window, {
      properties: [dir ? 'openDirectory' : 'openFile', 'multiSelections']
    }, (files) => {
      if (!files || files.length === 0) return
      uploadFiles(opts)(event, files)
    })
  }
}

export default function (opts) {
  ipcMain.on('open-file-dialog', openFileDialog(opts))
  ipcMain.on('open-dir-dialog', openFileDialog(opts, true))
}
