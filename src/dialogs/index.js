const showDialog = require('./dialog')
const { criticalErrorDialog, recoverableErrorDialog } = require('./errors')
const ipfsNotRunningDialog = require('./ipfs-not-running')
const selectDirectory = require('./select-directory')

module.exports = Object.freeze({
  showDialog,
  criticalErrorDialog,
  recoverableErrorDialog,
  ipfsNotRunningDialog,
  selectDirectory
})
