/**
 * A splash screen for the application that is shown while the webui is loading.
 *
 * This is to prevent the user from seeing the `Could not connect to the IPFS API` error
 * while we're still booting up the daemon.
 */
const { BrowserWindow } = require('electron')
const getCtx = require('../context')
const logger = require('../common/logger')
const path = require('node:path')

module.exports = async function createSplashScreen () {
  const ctx = getCtx()
  let splashScreen = null

  try {
    splashScreen = new BrowserWindow({
      title: 'IPFS Desktop splash screen',
      width: 250,
      height: 275,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      show: false
    })

    await splashScreen.loadFile(path.join(__dirname, '../../assets/pages/splash.html'))
    splashScreen.center()
  } catch (err) {
    logger.error('[splashScreen] could not create splash screen')
    logger.error(err)
    if (splashScreen) splashScreen.destroy()
    splashScreen = null
  }

  // Always publish, even on failure. setupWebUI and the error path in index.js
  // await this prop, and an unset one never resolves, so skipping it here
  // stalls startup instead of losing a splash screen.
  ctx.setProp('splashScreen', splashScreen)
}
