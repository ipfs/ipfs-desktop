const { registerAppStartTime } = require('./metrics/registerAppStartTime')
registerAppStartTime()
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
const { IS_MAC } = require('./common/consts')

// Hide Dock
if (app.dock) app.dock.hide()

// Sets User Model Id so notifications work on Windows 10
app.setAppUserModelId('io.ipfs.desktop')

// Fixes $PATH on macOS
if (IS_MAC) {
  fixPath()
}

// Only one instance can run at a time
if (!app.requestSingleInstanceLock()) {
  process.exit(0)
}
app.on('will-finish-launching', async () => {
  appContext.then((ctx) => setupProtocolHandlers(ctx)).catch((e) => {
    handleError(e)
  })
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
    const functions = [setupArgvFilesHandler, setupAutoLaunch, setupAutoGc, setupPubsub, setupNamesysPubsub, setupSecondInstance, setupTakeScreenshot, setupNpmOnIpfs, setupIpfsOnPath]
    for await (const fn of functions) {
      // try {
      if (fn.length > 0) {
        await fn(ctx).catch(handleError)
      } else {
        await fn().catch(handleError)
      }
      // } catch (err) {
      //   handleError(err)
      // }
    }
  } catch (err) {
    handleError(err)
  }

  // try {
  //   const ctx = await appContext
  //   await setupArgvFilesHandler(ctx).catch(handleError)
  //   await setupAutoLaunch(ctx).catch(handleError)
  //   await setupAutoGc(ctx).catch(handleError)
  //   await setupPubsub().catch(handleError)
  //   await setupNamesysPubsub().catch(handleError)
  //   await setupSecondInstance(ctx).catch(handleError)
  //   // Setup global shortcuts
  //   await setupTakeScreenshot(ctx).catch(handleError)
  //   // Setup PATH-related features
  //   await setupNpmOnIpfs(ctx).catch(handleError)
  //   await setupIpfsOnPath().catch(handleError)
  //   // const appStartTime = Date.now() - appStart
  //   // console.log('App start time is:', appStartTime)
  //   // appStart.end()
  // } catch (e) {
  //   handleError(e)
  //   // appStart.fail(e)
  // }
  // Countly.end_event('APP_START')
}

run()
