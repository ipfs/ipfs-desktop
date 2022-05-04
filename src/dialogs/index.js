const { dialog } = require('./dialog')
const showPrompt = require('./prompt')
const { recoverableErrorDialog } = require('./errors')
const ipfsNotRunningDialog = require('./ipfs-not-running')
const selectDirectory = require('./select-directory')
const criticalErrorDialog = require('./errors/criticalErrorDialog')

module.exports = Object.freeze({
  showDialog: dialog,
  showPrompt,
  criticalErrorDialog,
  recoverableErrorDialog,
  ipfsNotRunningDialog,
  selectDirectory
})
