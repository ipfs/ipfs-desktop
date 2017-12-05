import {dialog} from 'electron'
import uploadFiles from './upload-files'

export default function openFileDialog (window, ipfs, dir = false) {
  return (event, callback) => {
    dialog.showOpenDialog(window, {
      properties: [dir ? 'openDirectory' : 'openFile', 'multiSelections']
    }, (files) => {
      if (!files || files.length === 0) return
      uploadFiles(ipfs, event, files)
    })
  }
}
