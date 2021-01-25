require('v8-compile-cache')
const { app, dialog } = require('electron')
const fixPath = require('fix-path')
const { criticalErrorDialog } = require('./dialogs')
const logger = require('./common/logger')
const setupProtocolHandlers = require('./protocol-handlers')
const setupI18n = require('./i18n')
const setupNpmOnIpfs = require('./npm-on-ipfs')
const setupDaemon = require('./daemon')
const setupWebUI = require('./webui')
const setupAutoLaunch = require('./auto-launch')
const setupAutoGc = require('./automatic-gc')
const setupPubsub = require('./enable-pubsub')
const setupNamesysPubsub = require('./enable-namesys-pubsub')
const setupDownloadCid = require('./download-cid')
const setupTakeScreenshot = require('./take-screenshot')
const setupAppMenu = require('./app-menu')
const setupArgvFilesHandler = require('./argv-files-handler')
const setupAutoUpdater = require('./auto-updater')
const setupTray = require('./tray')
const setupIpfsOnPath = require('./ipfs-on-path')
const setupAnalytics = require('./analytics')
const setupSecondInstance = require('./second-instance')

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

const ctx = {}

app.on('will-finish-launching', () => {
  setupProtocolHandlers(ctx)
})

function handleError (err) {
  // Ignore network errors that might happen during the
  // execution.
  if (err.stack.includes('net::')) {
    return
  }

  logger.error(err)
  criticalErrorDialog(err)
}

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
    await setupAnalytics(ctx) // ctx.countlyDeviceId
    await setupI18n(ctx)
    await setupAppMenu(ctx)

    await setupWebUI(ctx) // ctx.webui, launchWebUI
    await setupTray(ctx) // ctx.tray
    await setupDaemon(ctx) // ctx.getIpfsd, startIpfs, stopIpfs, restartIpfs
    await setupAutoUpdater(ctx) // ctx.manualCheckForUpdates

    await Promise.all([
      setupArgvFilesHandler(ctx),
      setupAutoLaunch(ctx),
      setupAutoGc(ctx),
      setupPubsub(ctx),
      setupNamesysPubsub(ctx),
      setupSecondInstance(ctx),
      // Setup global shortcuts
      setupDownloadCid(ctx),
      setupTakeScreenshot(ctx),
      // Setup PATH-related features
      setupNpmOnIpfs(ctx),
      setupIpfsOnPath(ctx)
    ])
  } catch (e) {
    handleError(e)
  }
}

run()
