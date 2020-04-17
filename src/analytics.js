const Countly = require('countly-sdk-nodejs')
const { ipcMain } = require('electron')
const { COUNTLY_KEY } = require('./common/consts')

module.exports = async function (ctx) {
  Countly.init({
    url: 'https://countly.ipfs.io',
    app_key: COUNTLY_KEY,
    debug: process.env.DEBUG_COUNTLY === 'true',
    require_consent: true
  })

  ctx.countlyDeviceId = Countly.device_id

  ipcMain.on('countly.addConsent', (_, consent) => {
    Countly.add_consent(consent)
  })

  ipcMain.on('countly.removeConsent', (_, consent) => {
    Countly.remove_consent(consent)
  })
}
