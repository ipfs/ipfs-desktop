// @ts-check
const pDefer = require('p-defer')
const logger = require('./common/logger')

/**
 * @typedef { 'tray' | 'tray.update-menu' | 'countlyDeviceId' | 'manualCheckForUpdates' | 'startIpfs' | 'stopIpfs' | 'restartIpfs' | 'getIpfsd' | 'launchWebUI' | 'webui' | 'splashScreen' | 'i18n.initDone' } ContextProperties
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
 *
 * | Context property exists? | Is the backing promise fulfilled? | Method called | Is a deferred promise created? | Returned Value                                                                                           |
 * |--------------------------|-----------------------------------|---------------|--------------------------------|----------------------------------------------------------------------------------------------------------|
 * | No                       | N/A                               | GetProp       | Yes                            | A newly created deferred promise(unfulfilled)                                                            |
 * | No                       | N/A                               | SetProp       | Yes                            | void                                                                                                     |
 * | Yes                      | No                                | GetProp       | No                             | The found deferred promise (unfulfilled)                                                                 |
 * | Yes                      | No                                | SetProp       | No                             | void                                                                                                     |
 * | Yes                      | Yes                               | GetProp       | No                             | The found deferred promise (fulfilled)                                                                   |
 * | Yes                      | Yes                               | SetProp       | No                             | We throw an error here. Any getProps called for the property prior to this would have a hanging promise. |
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
    if (this._properties.has(propertyName)) {
      logger.error('[ctx] Property already exists')
      throw new Error(`[ctx] Property ${String(propertyName)} already exists`)
    }
    logger.info(`[ctx] setting ${String(propertyName)}`)
    try {
      this._properties.set(propertyName, value)
      this._resolvePropToValue(propertyName, value)
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

    const value = this._properties.get(propertyName)
    if (value != null) {
      logger.info(`[ctx] Found existing property ${String(propertyName)}`)
      this._resolvePropToValue(propertyName, value)
      // @ts-ignore
      return value
    } else {
      logger.info(`[ctx] Could not find property ${String(propertyName)}`)
    }
    // no value exists, create deferred promise and return the promise
    return this._createDeferredForProp(propertyName).promise
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
      try {
        return await originalFn(...args)
      } catch (err) {
        logger.error(`[ctx] Error calling ${String(propertyName)}`)
        logger.error(err)
        throw err
      }
    }
  }

  /**
   * Gets existing promise and resolves it with the given value.
   *
   * @private
   * @template T
   * @param {ContextProperties} propertyName
   * @param {T} value
   * @returns {void}
   */
  _resolvePropToValue (propertyName, value) {
    let deferred = this._promiseMap.get(propertyName)
    if (deferred == null) {
      logger.info(`[ctx] No promise found for ${String(propertyName)}`)
      deferred = this._createDeferredForProp(propertyName)
    }
    logger.info(`[ctx] Resolving promise for ${String(propertyName)}`)
    deferred.resolve(value)
  }

  /**
   * Returns the existing promise for a property if it exists.
   * If not, one is created and set in the `_promiseMap`, then returned
   *
   * @private
   * @template T
   * @param {ContextProperties} propertyName
   * @returns {pDefer.DeferredPromise<T>}
   */
  _createDeferredForProp (propertyName) {
    let deferred = this._promiseMap.get(propertyName)
    if (deferred == null) {
      deferred = pDefer()
      this._promiseMap.set(propertyName, deferred)
    }

    // @ts-expect-error - Need to fix generics
    return deferred
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
