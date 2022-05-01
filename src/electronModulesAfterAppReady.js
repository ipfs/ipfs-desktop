const electron = require('electron')
const logger = require('./common/logger')
const electronAppReady = require('./electronAppReady')
const handleError = require('./handleError')

const electronModulesAfterAppReady = electronAppReady().then(() => {
  return electron
}).catch((err) => {
  handleError(err)
  logger.error('Could not get electron modules after waiting for app \'ready\' event')
  process.exit(1)
})

module.exports = electronModulesAfterAppReady
