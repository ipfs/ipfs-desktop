// @ts-check
// const setupI18n = require('./i18n')
// const setupDaemon = require('./daemon')
// const setupWebUI = require('./webui')
// const setupAppMenu = require('./app-menu')
// const setupAutoUpdater = require('./auto-updater')
// const setupTray = require('./tray')
// const setupAnalytics = require('./analytics')
const pDefer = require('p-defer')
// const handleError = require('./handleError')
const logger = require('./common/logger')
// const { app } = require('electron')

/**
 * @extends {Record<string, unknown>}
 * @property {function} launchWebUI
 */
class Context {
  constructor () {
    this._properties = {}
    this._promiseMap = new Map()
    // (async () => {
    //   try {
    //     await this.setup()
    //   } catch (e) {
    //     logger.error(e)
    //   }
    // })()
  }

  // async waitForSetup () {
  //   this.setup()
  //   return Promise.allSettled([
  //     this.setupAnalytics,
  //     this.setupI18n,
  //     this.setupAppMenu,
  //     this.setupWebUI,
  //     this.setupAutoUpdater,
  //     this.setupTray,
  //     this.setupDaemon
  //   ])
  // }

  // async setup () {
  //   this.setupAnalytics = setupAnalytics()
  //   this.setupI18n = setupI18n()
  //   this.setupAppMenu = setupAppMenu()
  //   this.setupWebUI = setupWebUI()
  //   this.setupAutoUpdater = setupAutoUpdater()
  //   this.setupTray = setupTray()
  //   this.setupDaemon = setupDaemon()

  //   /**
  //    * A map from propertynames to the promise(s) it's dependent upon to be resolved.
  //    */
  //   this.propToPromiseMap = {
  //     countlyDeviceId: this.setupAnalytics,
  //     webui: this.setupWebUI,
  //     launchWebUI: this.setupWebUI,
  //     manualCheckForUpdates: this.setupAutoUpdater,
  //     tray: this.setupTray,
  //     getIpfsd: this.setupDaemon,
  //     startIpfs: this.setupDaemon,
  //     stopIpfs: this.setupDaemon,
  //     restartIpfs: this.setupDaemon
  //   }
  // }

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
      const value = this._properties[propertyName]
      this._resolvePropForValue(propertyName, value)
      return value
    }
    // no value exists, create deferred promise
    const deferred = pDefer()
    this._promiseMap.set(propertyName, deferred)
    return deferred.promise

    // const promiseForProperty = this.propToPromiseMap[propertyName]
    // if (promiseForProperty) {
    //   try {
    //     await promiseForProperty
    //     return this._properties[propertyName]
    //   } catch (e) {
    //     handleError(e)
    //   }
    // } else {
    //   throw new Error('No such propertyname exists')
    // }
  }

  _resolvePropForValue (propertyName, value) {
    if (this._promiseMap.has(propertyName)) {
      // we have a value and there is an unresolved deferred promise
      const deferred = this._promiseMap.get(propertyName)
      deferred.resolve(value)
    }
  }
}

let appContext

function getAppContext () {
  appContext = appContext ?? new Context()

  return appContext
}
// console.log(`appContext: `, appContext);
// console.log(`appContext.getProp: `, appContext.getProp);
// console.log(`appContext.setProp: `, appContext.setProp);

/**
 * @type {Context}
 * @property {function} launchWebUI
 */
// module.exports = new Proxy(appContext, {
//   async get (target, propertyName) {
//     return await target.get(propertyName)
//   },
//   set (target, propertyName, value) {
//     return target.set(propertyName, value)
//   }
// })
module.exports = getAppContext
