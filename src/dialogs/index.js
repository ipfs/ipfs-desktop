const showDialog = require('./dialog')
const showPrompt = require('./prompt')
const { criticalErrorDialog, recoverableErrorDialog } = require('./errors')
const ipfsNotRunningDialog = require('./ipfs-not-running')
const selectDirectory = require('./select-directory')

module.exports = Object.freeze({
  showDialog,
  showPrompt,
  criticalErrorDialog,
  recoverableErrorDialog,
  ipfsNotRunningDialog,
  selectDirectory
})
