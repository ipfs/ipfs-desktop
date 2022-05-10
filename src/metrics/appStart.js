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

const getSecondsSinceAppStart = (currentTime = performance.now()) => {
  return (currentTime - getAppStartTime()) / 1000
}

module.exports = { registerAppStartTime, getAppStartTime, getSecondsSinceAppStart }
