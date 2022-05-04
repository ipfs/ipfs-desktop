// @ts-check
const { app } = require('electron')
const criticalErrorDialog = require('./dialogs/errors/criticalErrorDialog')

/**
 * @type {null|AppReadyObject}
 */
let appReadyEventAndInfo = null

/**
 * @type {Promise<void>}
 */
const appReadySugar = app.whenReady()
/**
 * @typedef AppReadyObject
 * @type {object}
 * @property {Electron.Event} event
 * @property {Record<string, any> | Electron.NotificationResponse} info
 */

/**
 * @type {Promise<AppReadyObject>}
 */
const appReadyEvent = new Promise((resolve, reject) => {
  app.on('ready', (event, info) => {
    resolve({ event, info })
  })
}).then((result) => {
  appReadyEventAndInfo = result
  return result
})

const electronAppReady = async () => {
  if (appReadyEventAndInfo == null) {
    try {
      await Promise.race([appReadySugar, appReadyEvent])
      await appReadyEvent
    } catch (err) {
      criticalErrorDialog(err)
    }
  }
  return appReadyEventAndInfo
}

module.exports = electronAppReady
