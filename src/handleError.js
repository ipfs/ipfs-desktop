// @ts-check
const logger = require('./common/logger')
const { criticalErrorDialog } = require('./dialogs')

/**
 *
 * @param {Error|unknown} err
 * @returns
 */
function handleError (err) {
  if (err == null) {
    return
  }
  /**
   * Ignore network errors that might happen during the execution.
   */
  if ((/** @type Error */(err))?.stack?.includes('net::')) {
    return
  }

  logger.error(err)
  criticalErrorDialog(err)
}

module.exports = handleError
