import { app, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import { showErrorMessage, logger } from './utils'
import startup from './lib'

// Sets User Model Id so notifications work on Windows 10
app.setAppUserModelId('io.ipfs.desktop')

// Only one instance can run at a time
if (!app.requestSingleInstanceLock()) {
  dialog.showErrorBox(
    'Multiple instances',
    'Sorry, but there can be only one instance of IPFS Desktop running at the same time.'
  )

  // No windows were opened at this time so we don't need to do app.quit()
  process.exit(1)
}

function handleError (e) {
  // This is a special error used internally to close the app with status 1.
  if (e.message === 'IPFS_DESKTOP_EXIT') {
    return app.exit(1)
  }

  logger.error(e)
  showErrorMessage(e)
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

  autoUpdater.checkForUpdatesAndNotify()
  await startup()
}

run()
