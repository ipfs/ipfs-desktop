import { app, dialog } from 'electron'
import { store } from './utils'

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

async function run () {
  await app.whenReady()
  await menubar()

  if (!store.get('seenWelcome')) {
    // TODO: open WebUI on Welcome screen
  }
}

run()
