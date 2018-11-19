import { app, dialog, shell } from 'electron'
import { join } from 'path'
import { store, createDaemon } from './utils'
import startupMenubar from './menubar'
import registerHooks from './hooks'

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
  dialog.showMessageBox({
    type: 'error',
    title: 'Something wrong happened',
    message: e.stack + '\nPlease choose one of the options bellow. All of them will copy the error message to the clipboard.',
    buttons: [
      'Close',
      'Open logs',
      'Create a new issue'
    ]
  }, option => {
    if (option === 1) {
      const path = app.getPath('userData')
      shell.openItem(path)
    } else if (option === 2) {
      let text = 'Please describe what you were doing when this error happened.\n\n```\n' + e.stack + '\n```'
      shell.openExternal('https://github.com/ipfs-shipyard/ipfs-desktop/issues/new?body=' + encodeURI(text))
    }

    process.exit(1)
  })
}

async function setupConnection () {
  let config = store.get('config')

  if (config === null) {
    config = {
      type: 'go',
      path: join(app.getPath('home'), '.ipfs')
    }

    store.set('config', config)
  }

  return createDaemon(config)
}

async function run () {
  try {
    await app.whenReady()
  } catch (e) {
    dialog.showErrorBox('Electron could not start', e.stack)
    process.exit(1)
  }

  try {
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
  } catch (e) {
    handleError(e)
  }
}

run()
