const showDialog = require('./dialog')
const showAsyncDialog = require('./async-dialog')
const showPrompt = require('./prompt')
const { criticalErrorDialog, recoverableErrorDialog } = require('./errors')
const ipfsNotRunningDialog = require('./ipfs-not-running')
const selectDirectory = require('./select-directory')

module.exports = Object.freeze({
  showAsyncDialog,
  showDialog,
  showPrompt,
  criticalErrorDialog,
  recoverableErrorDialog,
  ipfsNotRunningDialog,
  selectDirectory
})
