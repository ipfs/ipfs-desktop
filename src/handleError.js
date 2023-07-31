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
    logger.debug('[global handleError] No error to handle')
    return
  }
  /**
   * Ignore network errors that might happen during the execution.
   */
  if ((/** @type Error */(err))?.stack?.includes('net::')) {
    logger.debug('[global handleError] Ignoring network error')
    return
  }

  logger.error(err)
  criticalErrorDialog(err)
}

module.exports = handleError
