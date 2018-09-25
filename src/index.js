import { app, dialog } from 'electron'

import welcome from './welcome'
import menubar from './menubar'

// Only one instance can run at a time
if (!app.requestSingleInstanceLock()) {
  dialog.showErrorBox(
    'Multiple instances',
    'Sorry, but there can be only one instance of IPFS Desktop running at the same time.'
  )

  // No windows were opened at this time so we don't need to do app.quit()
  process.exit(0)
}

// Avoid quitting the app when all windows are closed
app.on('window-all-closed', e => e.preventDefault())

async function run () {
  await app.whenReady()

  // welcome()
  menubar()
}

run()
