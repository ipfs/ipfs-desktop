/**
 * A splash screen for the application that is shown while the webui is loading.
 *
 * This is to prevent the user from seeing the `Could not connect to the IPFS API` error
 * while we're still booting up the daemon.
 */
const { BrowserWindow } = require('electron')
const getCtx = require('../context')
const i18n = require('i18next')

module.exports = function createSplashScreen () {
  const ctx = getCtx()
  const splashScreen = new BrowserWindow({
    width: 500,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    show: false
  })
  splashScreen.loadFile('src/splash/splash.html')
  splashScreen.center()

  splashScreen.webContents.executeJavaScript(
    `setHeading("${i18n.t('ipfsIsStarting')}")`
  )

  ctx.setProp('splashScreen', splashScreen)
}
