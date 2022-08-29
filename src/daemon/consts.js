/**
 * IPFS daemon status codes for display in the UI.
 *
 * @type {Object.<string, number>}
 * @readonly
 */
const STATUS = Object.freeze({
  STARTING_STARTED: 1,
  STARTING_FINISHED: 2,
  STARTING_FAILED: 3,
  STOPPING_STARTED: 4,
  STOPPING_FINISHED: 5,
  STOPPING_FAILED: 6
})

module.exports = { STATUS }
