const showDialog = require('./dialog.js')
const showPrompt = require('./prompt/index.js')
const { criticalErrorDialog, recoverableErrorDialog } = require('./errors.js')
const ipfsNotRunningDialog = require('./ipfs-not-running.js')
const selectDirectory = require('./select-directory.js')

module.exports = {
  showDialog,
  showPrompt,
  criticalErrorDialog,
  recoverableErrorDialog,
  ipfsNotRunningDialog,
  selectDirectory
}
