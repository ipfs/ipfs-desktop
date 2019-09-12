import { app, dialog } from 'electron'
import fixPath from 'fix-path'
import { criticalErrorDialog } from './dialogs'
import logger from './common/logger'
import setupProtocolHandlers from './protocol-handlers'
import setupI18n from './i18n'
import setupNpmOnIpfs from './npm-on-ipfs'
import setupDaemon from './daemon'
import setupWebUI from './webui'
import setupAutoLaunch from './auto-launch'
import setupDownloadHash from './download-hash'
import setupTakeScreenshot from './take-screenshot'
import setupAppMenu from './app-menu'
import setupArgvFilesHandler from './argv-files-handler'
import setupAutoUpdater from './auto-updater'
import setupTray from './tray'
import setupIpfsOnPath from './ipfs-on-path'
import setupAnalytics from './analytics'

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

    await setupAutoUpdater(ctx) // ctx.checkForUpdates
    await setupWebUI(ctx) // ctx.webui, launchWebUI
    await setupTray(ctx) // ctx.tray
    await setupDaemon(ctx) // ctx.getIpfsd, startIpfs, stopIpfs, restartIpfs

    await Promise.all([
      setupArgvFilesHandler(ctx),
      setupAutoLaunch(ctx),
      // Setup global shortcuts
      setupDownloadHash(ctx),
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
