// @ts-check
const pDefer = require('p-defer')
const logger = require('./common/logger')

/**
 * @typedef {'tray-menu' | 'tray' | 'tray-menu-state' | 'tray.update-menu' | 'countlyDeviceId' | 'manualCheckForUpdates' | 'startIpfs' | 'stopIpfs' | 'restartIpfs' | 'getIpfsd' | 'launchWebUI' | 'webui'} ContextProperties
 */

/**
 * Context helps the app do many different things without explicitly depending on each other. Instead, each module
 * can set a property on the context and other modules can get that property from the context when they need it.
 *
 * Benefits:
 * * Avoid passing the same object to many different modules.
 * * Avoid circular dependencies and makes it easier to test modules in isolation.
 * * Speed up startup time by only loading what we need when we need it.
 *
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
   * @param {ContextProperties} propertyName
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
   * @param {ContextProperties} propertyName
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
   * @param {ContextProperties} propertyName
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
   * @param {ContextProperties} propertyName
   * @param {T} value
   * @returns {void}
   */
  _resolvePropForValue (propertyName, value) {
    const deferred = this._promiseMap.get(propertyName)
    if (deferred != null) {
      logger.info(`[ctx] Resolving promise for ${String(propertyName)}`)
      // we have a value and there is an unresolved deferred promise
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
   * @param {ContextProperties} propertyName
   * @returns {Promise<T>}
   */
  _createDeferredForProp (propertyName) {
    const promiseVal = this._promiseMap.get(propertyName)
    if (promiseVal == null) {
      const deferred = pDefer()
      this._promiseMap.set(propertyName, deferred)
      return deferred.promise
    }

    // @ts-expect-error - Need to fix generics
    return promiseVal.promise
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
