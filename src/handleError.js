const logger = require('./common/logger')
const { criticalErrorDialog } = require('./dialogs')

/**
 *
 * @param {Error} err
 * @returns
 */
function handleError (err) {
  // Ignore network errors that might happen during the
  // execution.
  if (err.stack.includes('net::')) {
    return
  }

  logger.error(err)
  criticalErrorDialog(err)
}

module.exports = handleError
