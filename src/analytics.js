const { join } = require('path')
const { mkdir } = require('fs/promises')

const Countly = require('countly-sdk-nodejs')
const { app, ipcMain } = require('electron')

const { COUNTLY_KEY } = require('./common/consts')
const handleError = require('./handleError')

/**
 * This function may fail with permissions/access errors to countlyDataDir. Node best practices are to avoid calls to
 * existsSync and `access` prior to file open, and to simply attempt to access the file within a try/catch, handling any errors appropriately.
 *
 * @param {string} countlyDataDir
 */
const countlyInit = (countlyDataDir) => {
  /**
   * @see https://support.count.ly/hc/en-us/articles/360037442892-NodeJS-SDK#setup-properties
   */
  Countly.init({
    url: 'https://countly.ipfs.io',
    app_key: COUNTLY_KEY,
    debug: process.env.DEBUG_COUNTLY === 'true',
    require_consent: true,
    // countlyDataDir for read-only node_modules
    storage_path: countlyDataDir
  })
}
/**
 *
 * @param {Awaited<import('./context')>} ctx
 */
module.exports = async function (ctx) {
  const countlyDataDir = join(app.getPath('userData'), 'countly-data')

  try {
    countlyInit(countlyDataDir)
  } catch (err) {
    // workaround: recursive mkdir https://github.com/Countly/countly-sdk-nodejs/pull/14
    await mkdir(countlyDataDir, { recursive: true })
    countlyInit(countlyDataDir)
  }
  ctx.countlyDeviceId = Countly.device_id

  try {
    Countly.begin_session()
    Countly.track_errors()
  } catch (err) {
    handleError(err)
  }

  ipcMain.on('countly.addConsent', (_, consent) => {
    Countly.add_consent(consent)
  })

  ipcMain.on('countly.removeConsent', (_, consent) => {
    Countly.remove_consent(consent)
  })
}
