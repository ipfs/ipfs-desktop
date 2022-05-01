require('v8-compile-cache')
const { app } = require('electron')

if (process.env.NODE_ENV === 'test') {
  const path = require('path')

  app.setPath('home', process.env.HOME)
  app.setPath('userData', path.join(process.env.HOME, 'data'))
}

const fixPath = require('fix-path')
const setupProtocolHandlers = require('./protocol-handlers')
const setupNpmOnIpfs = require('./npm-on-ipfs')
const setupAutoLaunch = require('./auto-launch')
const setupAutoGc = require('./automatic-gc')
const setupPubsub = require('./enable-pubsub')
const setupNamesysPubsub = require('./enable-namesys-pubsub')
const setupTakeScreenshot = require('./take-screenshot')
const setupArgvFilesHandler = require('./argv-files-handler')
const setupIpfsOnPath = require('./ipfs-on-path')
const setupSecondInstance = require('./second-instance')
const appContext = require('./context')
const handleError = require('./handleError')
const logger = require('./common/logger')
const electronAppReady = require('./electronAppReady')

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
app.on('will-finish-launching', async () => {
  setupProtocolHandlers(await appContext)
})

process.on('uncaughtException', handleError)
process.on('unhandledRejection', handleError)

async function run () {
  try {
    await electronAppReady
  } catch (e) {
    // We cannot show a dialog box using electron if electron does not start.
    // dialog.showErrorBox('Electron could not start', e.stack)
    logger.error('Electron could not start')
    app.exit(1)
  }

  try {
    const ctx = await appContext

    await Promise.all([
      setupArgvFilesHandler(ctx),
      setupAutoLaunch(ctx),
      setupAutoGc(ctx),
      setupPubsub(ctx),
      setupNamesysPubsub(ctx),
      setupSecondInstance(ctx),
      // Setup global shortcuts
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
