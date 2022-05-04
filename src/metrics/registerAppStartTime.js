const { performance } = require('perf_hooks')

/**
 * @type {number}
 */
let startTime

/**
 * @returns {void}
 */
const registerAppStartTime = () => {
  if (startTime == null) {
    startTime = performance.now()
  }
}
/**
 *
 * @returns {number}
 */
const getAppStartTime = () => {
  if (startTime == null) {
    throw new Error('You must call `registerAppStartTime` prior to calling `getAppStartTime`')
  }
  return startTime
}

module.exports = { registerAppStartTime, getAppStartTime }
