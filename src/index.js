require('v8-compile-cache')
const { app, dialog } = require('electron')
const fixPath = require('fix-path')
const setupAnalytics = require('./analytics')
const { analyticsKeys } = require('./analytics/keys')
const setupAppMenu = require('./app-menu')
const setupArgvFilesHandler = require('./argv-files-handler')
const setupAutoLaunch = require('./auto-launch')
const setupAutoUpdater = require('./auto-updater')
const setupAutoGc = require('./automatic-gc')
const logger = require('./common/logger')
const getCtx = require('./context')
const setupDaemon = require('./daemon')
const setupNamesysPubsub = require('./enable-namesys-pubsub')
const setupPubsub = require('./enable-pubsub')
const handleError = require('./handleError')
const setupI18n = require('./i18n')
const { registerAppStartTime, getSecondsSinceAppStart } = require('./metrics/appStart')
const setupProtocolHandlers = require('./protocol-handlers')
const setupSecondInstance = require('./second-instance')
const createSplashScreen = require('./splash/create-splash-screen')
const setupTakeScreenshot = require('./take-screenshot')
const setupTray = require('./tray')
const setupWebUI = require('./webui')

registerAppStartTime()

if (process.env.NODE_ENV === 'test') {
  const path = require('path')
  if (process.env.HOME) {
    app.setPath('home', process.env.HOME)
    app.setPath('userData', path.join(process.env.HOME, 'data'))
  }
}

// Hide Dock
if (app.dock) { app.dock.hide() }

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
    // @ts-ignore
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
    if (splash && !splash.isDestroyed()) { splash.hide() }
    handleError(e)
  }
}

run()
