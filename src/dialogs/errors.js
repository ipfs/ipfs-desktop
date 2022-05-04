// @ts-check
const generateErrorIssueUrl = require('../github/generateErrorIssueUrl')
const criticalErrorDialog = require('./errors/criticalErrorDialog')
const { recoverableErrorDialog } = require('./errors/recoverableErrorDialog')

module.exports = Object.freeze({
  criticalErrorDialog,
  recoverableErrorDialog,
  generateErrorIssueUrl
})
