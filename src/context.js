// @ts-check
const pDefer = require('p-defer')
const logger = require('./common/logger')

/**
 * @extends {Record<string, unknown>}
 * @property {function} launchWebUI
 */
class Context {
  constructor () {
    /**
     * Stores prop->value mappings.
     * @type {Map<string|symbol, unknown>}
     */
    this._properties = new Map()

    /**
     * Stores prop->Promise mappings.
     * @type {Map<string|symbol, pDefer.DeferredPromise<unknown>>}
     */
    this._promiseMap = new Map()
  }

  /**
   * Set the value of a property to a value.
   * This method supports overwriting values.
   *
   * @template T
   * @param {string|symbol} propertyName
   * @param {T} value
   *
   * @returns {void}
   */
  setProp (propertyName, value) {
    logger.info(`[ctx] setting ${String(propertyName)}`)
    try {
      this._properties.set(propertyName, value)
      this._resolvePropForValue(propertyName, value)
    } catch (e) {
      logger.error(e)
    }
  }

  /**
   * Get the value of a property wrapped in a promise.
   * @template T
   * @param {string|symbol} propertyName
   * @returns {Promise<T>}
   */
  async getProp (propertyName) {
    logger.info(`[ctx] getting ${String(propertyName)}`)

    if (this._properties.has(propertyName)) {
      logger.info(`[ctx] Found existing property ${String(propertyName)}`)
      const value = this._properties.get(propertyName)
      this._resolvePropForValue(propertyName, value)
      // @ts-ignore
      return value
    } else {
      logger.info(`[ctx] Could not find property ${String(propertyName)}`)
    }
    // no value exists, create deferred promise and return the promise
    return this._createDeferredForProp(propertyName)
  }

  /**
   * A simple helper to improve DX and UX when calling functions.
   *
   * This function allows you to request a function from AppContext without blocking until you actually need to call it.
   * @param {string|symbol} propertyName
   * @returns {(...args: unknown[]) => Promise<unknown>}
   */
  getFn (propertyName) {
    const originalFnPromise = this.getProp(propertyName)

    return async (...args) => {
      const originalFn = await originalFnPromise
      return originalFn(...args)
    }
  }

  /**
   * Gets existing promise and resolves it with the given value.
   * If no promise exists, it creates one and calls itself again. (this shouldn't be necessary but is a fallback for a gotcha)
   * @template T
   * @param {string|symbol} propertyName
   * @param {T} value
   * @returns {void}
   */
  _resolvePropForValue (propertyName, value) {
    if (this._promiseMap.has(propertyName)) {
      logger.info(`[ctx] Resolving promise for ${String(propertyName)}`)
      // we have a value and there is an unresolved deferred promise
      const deferred = this._promiseMap.get(propertyName)
      // @ts-ignore
      deferred.resolve(value)
    } else {
      logger.info(`[ctx] No promise found for ${String(propertyName)}`)
      this._createDeferredForProp(propertyName)
      this._resolvePropForValue(propertyName, value)
    }
  }

  /**
   *
   * Returns the existing promise for a property if it exists. If not, one is created and set in the `_promiseMap`, then returned
   * @template T
   * @param {string|symbol} propertyName
   * @returns {Promise<T>}
   */
  _createDeferredForProp (propertyName) {
    if (!this._promiseMap.has(propertyName)) {
      const deferred = pDefer()
      this._promiseMap.set(propertyName, deferred)
      return deferred.promise
    }

    // @ts-ignore
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
