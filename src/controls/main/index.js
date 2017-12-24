import fileHistory from './file-history'
import openFileDialog from './open-file-dialog'
import openSettings from './open-settings'
import openWebUI from './open-webui'
import settings from './settings'
import takeScreenshot from './take-screenshot'
import toggleSticky from './toggle-sticky'
import uploadFiles from './upload-files'

export default function (opts) {
  fileHistory(opts)
  openFileDialog(opts)
  openSettings(opts)
  openWebUI(opts)
  settings(opts)
  takeScreenshot(opts)
  toggleSticky(opts)
  uploadFiles(opts)
}
