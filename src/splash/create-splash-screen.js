/**
 * A splash screen for the application that is shown while the webui is loading.
 *
 * This is to prevent the user from seeing the `Could not connect to the IPFS API` error
 * while we're still booting up the daemon.
 */
const path = require('node:path')
const { BrowserWindow } = require('electron')
const logger = require('../common/logger')
const getCtx = require('../context')

module.exports = async function createSplashScreen () {
  const ctx = getCtx()
  const splashScreen = new BrowserWindow({
    title: 'IPFS Desktop splash screen',
    width: 250,
    height: 275,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    show: false
  })

  try {
    await splashScreen.loadFile(path.join(__dirname, '../../assets/pages/splash.html'))
  } catch (err) {
    logger.error('[splashScreen] loadFile failed')
    logger.error(String(err))
    return
  }

  splashScreen.center()

  ctx.setProp('splashScreen', splashScreen)
}
