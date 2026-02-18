// @ts-check
const { app, dialog } = require('electron')
const getCtx = require('./context.js')
const fixPath = require('fix-path')
const logger = require('./common/logger.js')
const setupProtocolHandlers = require('./protocol-handlers.js')
const setupI18n = require('./i18n.js')
const setupDaemon = require('./daemon/index.js')
const setupWebUI = require('./webui/index.js')
const setupAutoLaunch = require('./auto-launch.js')
const setupAutoGc = require('./automatic-gc.js')
const setupPubsub = require('./enable-pubsub.js')
const setupNamesysPubsub = require('./enable-namesys-pubsub.js')
const setupTakeScreenshot = require('./take-screenshot.js')
const setupAppMenu = require('./app-menu.js')
const setupArgvFilesHandler = require('./argv-files-handler.js')
const setupAutoUpdater = require('./auto-updater/index.js')
const setupTray = require('./tray.js')
const setupAnalytics = require('./analytics/index.js')
const setupSecondInstance = require('./second-instance.js')
const { analyticsKeys } = require('./analytics/keys.js')
const handleError = require('./handleError.js')
const createSplashScreen = require('./splash/create-splash-screen.js')
const { registerAppStartTime, getSecondsSinceAppStart } = require('./metrics/appStart.js')
require('v8-compile-cache')

registerAppStartTime()

if (process.env.NODE_ENV === 'test') {
  const path = require('path')
  if (process.env.HOME) {
    app.setPath('home', process.env.HOME)
    app.setPath('userData', path.join(process.env.HOME, 'data'))
  }
}

// Hide Dock
if (app.dock) app.dock.hide()

// Sets User Model Id so notifications work on Windows 10
app.setAppUserModelId('io.ipfs.desktop')

// Fixes $PATH on macOS
fixPath()

// Only one instance can run at a time
if (!app.requestSingleInstanceLock()) {
  process.exit(0)
}

app.on('will-finish-launching', () => {
  setupProtocolHandlers()
})

process.on('uncaughtException', handleError)
process.on('unhandledRejection', handleError)

async function run () {
  try {
    await app.whenReady()
  } catch (e) {
    dialog.showErrorBox('Electron could not start', e.stack)
    app.exit(1)
  }

  try {
    await Promise.all([
      createSplashScreen(),
      setupDaemon(), // ctx.getIpfsd, startIpfs, stopIpfs, restartIpfs
      setupAnalytics(), // ctx.countlyDeviceId
      setupI18n(),
      setupAppMenu(),

      setupWebUI(), // ctx.webui, launchWebUI
      setupAutoUpdater(), // ctx.manualCheckForUpdates
      setupTray(), // ctx.tray
      setupArgvFilesHandler(),
      setupAutoLaunch(),
      setupAutoGc(),
      setupPubsub(),
      setupNamesysPubsub(),
      setupSecondInstance(),
      // Setup global shortcuts
      setupTakeScreenshot()
    ])
    const submitAppReady = () => {
      logger.addAnalyticsEvent({ withAnalytics: analyticsKeys.APP_READY, dur: getSecondsSinceAppStart() })
    }
    const webui = await getCtx().getProp('webui')
    if (webui.webContents.isLoading()) {
      webui.webContents.once('dom-ready', submitAppReady)
    } else {
      submitAppReady()
    }
  } catch (e) {
    const splash = await getCtx().getProp('splashScreen')
    if (splash && !splash.isDestroyed()) splash.hide()
    handleError(e)
  }
}

run()
