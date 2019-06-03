import { app, dialog } from 'electron'
import { logger } from './utils'
import earlySetup from './early'
import lateSetup from './late'
import { criticalErrorDialog } from './dialogs'
import fixPath from 'fix-path'

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

let ctx = {}

app.on('will-finish-launching', () => {
  earlySetup(ctx)
})

function handleError (e) {
  logger.error(e)
  criticalErrorDialog(e)
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
    await lateSetup(ctx)
  } catch (e) {
    handleError(e)
  }
}

run()
