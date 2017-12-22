import {ipcMain} from 'electron'

export default function (opts) {
  let {fileHistory, send} = opts

  let handler = () => {
    send('files', fileHistory.toArray())
  }

  ipcMain.on('request-files', handler)
  fileHistory.on('change', handler)
}
