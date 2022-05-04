// @ts-check
const issueTitle = require('./issueTitle')
const issueTemplate = require('./issueTemplate')

const MAX_URL_LENGTH = 1999

const generateErrorIssueUrl = (e) => {
  const title = encodeURI(issueTitle(e))
  const body = encodeURI(issueTemplate(e))

  return `https://github.com/ipfs-shipyard/ipfs-desktop/issues/new?labels=kind%2Fbug%2C+need%2Ftriage&template=bug_report.md&title=${title}&body=${body}`.substring(0, MAX_URL_LENGTH)
}

module.exports = generateErrorIssueUrl
