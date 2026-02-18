// @ts-check
const Countly = require('countly-sdk-nodejs')
const { app, ipcMain } = require('electron')
const { COUNTLY_KEY } = require('../common/consts.js')
const { join } = require('path')
const { existsSync, mkdirSync } = require('fs')
const ipcMainEvents = require('../common/ipc-main-events.js')
const logger = require('../common/logger.js')
const getCtx = require('../context.js')

const defaultExport = async function () {
  logger.info('[analytics] init...')
  // workaround: recursive mkdir https://github.com/Countly/countly-sdk-nodejs/pull/14
  const countlyDataDir = join(app.getPath('userData'), 'countly-data')
  if (!existsSync(countlyDataDir)) {
    mkdirSync(countlyDataDir, { recursive: true })
  }

  // @ts-expect-error
  Countly.init({
    url: 'https://countly.ipfs.io',
    app_key: COUNTLY_KEY,
    debug: process.env.DEBUG_COUNTLY === 'true',
    require_consent: true,
    // countlyDataDir for read-only node_modules
    storage_path: countlyDataDir
  })

  // @ts-expect-error
  getCtx().setProp('countlyDeviceId', Countly.device_id)

  ipcMain.on(ipcMainEvents.COUNTLY_ADD_CONSENT, (_, consent) => {
    Countly.add_consent(consent)
  })

  ipcMain.on(ipcMainEvents.COUNTLY_REMOVE_CONSENT, (_, consent) => {
    Countly.remove_consent(consent)
  })
  logger.info('[analytics] init done')
}

module.exports = defaultExport
