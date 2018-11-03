import { app, dialog } from 'electron'
import { store, Connection, ConnectionManager } from './utils'
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

async function setupConnectionManager () {
  const configs = store.get('configs')
  const defaultConfig = store.get('defaultConfig')
  const connManager = new ConnectionManager()

  for (const id of Object.keys(configs)) {
    const conn = new Connection(configs[id], id)

    if (!conn.justApi) {
      await conn.init()
    }

    connManager.addConnection(conn)
  }

  if (defaultConfig) {
    connManager.connect(defaultConfig)
  }

  return connManager
}

async function run () {
  await app.whenReady()

  // Initial options object
  let opts = {
    connManager: await setupConnectionManager()
  }

  // Initialize windows. These can add properties to opts
  await startupMenubar(opts)

  // Register hooks
  await registerHooks(opts)

  if (!store.get('seenWelcome')) {
    // TODO: open WebUI on Welcome screen
  }
}

run()
