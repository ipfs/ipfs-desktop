import autoLaunch from './auto-launch'
import downloadHash from './download-hash'
import fileHistory from './file-history'
import menuShortcuts from './menu-shortcuts'
import openFileDialog from './open-file-dialog'
import openUrl from './open-url'
import openWebUI from './open-webui'
import pinnedFiles from './pinned-files'
import settings from './settings'
import takeScreenshot from './take-screenshot'
import toggleSticky from './toggle-sticky'
import uploadFiles from './upload-files'

export default function (opts) {
  autoLaunch(opts)
  downloadHash(opts)
  fileHistory(opts)
  menuShortcuts(opts)
  openFileDialog(opts)
  openUrl(opts)
  openWebUI(opts)
  pinnedFiles(opts)
  settings(opts)
  takeScreenshot(opts)
  toggleSticky(opts)
  uploadFiles(opts)
}
