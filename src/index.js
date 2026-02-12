// @ts-check
const { registerAppStartTime, getSecondsSinceAppStart } = require('./metrics/appStart')
registerAppStartTime()
// v8-compile-cache interferes with dynamic import in this process, so keep it disabled.

const emitWarning = process.emitWarning.bind(process)
process.emitWarning = (warning, ...args) => {
  // Electron's ASAR shim currently triggers DEP0180 internally (asarStatsToFsStats).
  // Filter this known upstream warning to keep runtime logs actionable.
  const warningCode = (
    (warning && typeof warning === 'object' && warning.code) ||
    (args[0] && typeof args[0] === 'object' && args[0].code) ||
    (typeof args[1] === 'string' && args[1]) ||
    undefined
  )
  if (warningCode === 'DEP0180') return
  return emitWarning(warning, ...args)
}

const { app, dialog } = require('electron')

if (process.env.NODE_ENV === 'test') {
  const path = require('path')
  if (process.env.HOME) {
    app.setPath('home', process.env.HOME)
    app.setPath('userData', path.join(process.env.HOME, 'data'))
  }
}

const getCtx = require('./context')
const fixPath = require('fix-path')
const logger = require('./common/logger')
const setupProtocolHandlers = require('./protocol-handlers')
const setupI18n = require('./i18n')
const setupDaemon = require('./daemon')
const setupWebUI = require('./webui')
const setupAutoLaunch = require('./auto-launch')
const setupAutoGc = require('./automatic-gc')
const setupPubsub = require('./enable-pubsub')
const setupNamesysPubsub = require('./enable-namesys-pubsub')
const setupTakeScreenshot = require('./take-screenshot')
const setupAppMenu = require('./app-menu')
const setupArgvFilesHandler = require('./argv-files-handler')
const setupAutoUpdater = require('./auto-updater')
const setupTray = require('./tray')
const setupAnalytics = require('./analytics')
const setupSecondInstance = require('./second-instance')
const { analyticsKeys } = require('./analytics/keys')
const handleError = require('./handleError')
const createSplashScreen = require('./splash/create-splash-screen')

// Hide Dock
if (app.dock) app.dock.hide()

// Sets User Model Id so notifications work on Windows 10
app.setAppUserModelId('io.ipfs.desktop')

// Fixes $PATH on macOS
// fix-path v5 is ESM-only; require() returns `{ default }` there.
const fixPathFn = (typeof fixPath === 'function' ? fixPath : fixPath?.default)
if (typeof fixPathFn === 'function') fixPathFn()

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
