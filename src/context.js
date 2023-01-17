// @ts-check
const pDefer = require('p-defer')
const logger = require('./common/logger')

/**
 * @extends {Record<string, unknown>}
 * @property {function} launchWebUI
 */
class Context {
  constructor () {
    this._properties = {}
    this._promiseMap = new Map()
  }

  /**
   * @param {string|symbol} propertyName
   * @param {unknown} value
   *
   * @returns {void}
   */
  setProp (propertyName, value) {
    logger.info(`[ctx] setting ${String(propertyName)}`)
    try {
      this._properties[propertyName] = value
      this._resolvePropForValue(propertyName, value)
    } catch {
      // deferred.reject()
    }
  }

  /**
   *
   * @param {string|symbol} propertyName
   */
  async getProp (propertyName) {
    logger.info(`[ctx] getting ${String(propertyName)}`)

    if (this._properties[propertyName]) {
      logger.info(`[ctx] Found existing property ${String(propertyName)}`)
      const value = this._properties[propertyName]
      this._resolvePropForValue(propertyName, value)
      return value
    } else {
      logger.info(`[ctx] Could not find property ${String(propertyName)}`)
    }
    // no value exists, create deferred promise
    return this._createDeferredForProp(propertyName)
  }

  _resolvePropForValue (propertyName, value) {
    if (this._promiseMap.has(propertyName)) {
      logger.info(`[ctx] Resolving promise for ${String(propertyName)}`)
      // we have a value and there is an unresolved deferred promise
      const deferred = this._promiseMap.get(propertyName)
      deferred.resolve(value)
      // this._promiseMap.delete(propertyName)
    } else {
      logger.info(`[ctx] No promise found for ${String(propertyName)}`)
      this._createDeferredForProp(propertyName)
      this._resolvePropForValue(propertyName, value)
    }
  }

  _createDeferredForProp (propertyName) {
    if (!this._promiseMap.has(propertyName)) {
      const deferred = pDefer()
      this._promiseMap.set(propertyName, deferred)
      return deferred.promise
    }

    return this._promiseMap.get(propertyName).promise
  }
}

/**
 * @type {Context}
 */
let appContext

/**
 *
 * @returns {Context}
 */
function getAppContext () {
  appContext = appContext ?? new Context()

  return appContext
}

module.exports = getAppContext
