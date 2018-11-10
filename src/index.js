import { app, dialog } from 'electron'
import { join } from 'path'
import { store, Connection } from './utils'
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

/*
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["webui://-", "https://webui.ipfs.io"]'
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '[""]'
*/

async function setupConnection () {
  let config = store.get('config')

  if (config === null) {
    config = {
      type: 'go',
      path: join(app.getPath('home'), '.ipfs')
    }

    store.set('config', config)
  }

  const conn = new Connection(config)
  await conn.init()
  await conn.start()

  let origins = await conn.api.config.get('API.HTTPHeaders.Access-Control-Allow-Origin') || []
  if (!origins.includes('webui://-')) origins.push('webui://-')
  if (!origins.includes('https://webui.ipfs.io')) origins.push('https://webui.ipfs.io')

  await conn.api.config.set('API.HTTPHeaders.Access-Control-Allow-Origin', origins)
  await conn.api.config.set('API.HTTPHeaders.Access-Control-Allow-Method', ['PUT', 'GET', 'POST'])
  await conn.api.config.set('API.HTTPHeaders.Access-Control-Allow-Credentials', ['true'])

  return conn
}

async function run () {
  await app.whenReady()

  // Initial options object
  let opts = {
    conn: await setupConnection()
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
