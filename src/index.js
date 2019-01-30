import { app, dialog } from 'electron'
import { showErrorMessage, logger } from './utils'
import startup from './lib'

// Sets User Model Id so notifications work on Windows 10
app.setAppUserModelId('io.ipfs.desktop')

// Only one instance can run at a time
if (!app.requestSingleInstanceLock()) {
  process.exit(0)
}

function handleError (e) {
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

  try {
    await startup()
  } catch (e) {
    handleError(e)
  }
}

run()
