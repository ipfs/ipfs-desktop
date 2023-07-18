const logger = require('../common/logger')
const store = require('../common/store')

/**
 * @template {unknown} R
 * @param {string} key
 * @param {unknown} value
 * @param {() => Promise<R>|R|void} [onSuccessFn]
 * @returns {Promise<R|void>}
 */
module.exports = async function (key, value, onSuccessFn) {
  try {
    store.set(key, value)
    if (typeof onSuccessFn === 'function') {
      return onSuccessFn()
    }
  } catch (err) {
    logger.error(`Could not set store key '${key}' to '${value}'`, /** @type {Error} */(err))
  }
}
