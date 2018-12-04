import { app, dialog } from 'electron'
import { join } from 'path'
import { store, createDaemon, logger  } from './utils'
import startupMenubar from './menubar'
import registerHooks from './hooks'

// Only one instance can run at a time
if (!app.requestSingleInstanceLock()) {
  dialog.showErrorBox(
    'Multiple instances',
    'Sorry, but there can be only one instance of IPFS Desktop running at the same time.'
  )

  // No windows were opened at this time so we don't need to do app.quit()
  process.exit(0)
}

async function setupConnection () {
  let config = store.get('config')

  if (config === null) {
    config = {
      type: 'go',
      path: join(app.getPath('home'), '.ipfs')
    }
  }

  store.set('config', config)

  return createDaemon(config)
}

async function run () {
  await app.whenReady()

  // Initial context object
  let ctx = {
    ipfsd: await setupConnection()
  }

  // Initialize windows. These can add properties to context
  await startupMenubar(ctx)

  // Register hooks
  await registerHooks(ctx)

  if (!store.get('seenWelcome')) {
    // TODO: open WebUI on Welcome screen
  }
}

run()
