import { app, dialog } from 'electron'
import { store, createDaemon, showErrorMessage } from './utils'
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

async function run () {
  try {
    await app.whenReady()
  } catch (e) {
    dialog.showErrorBox('Electron could not start', e.stack)
    app.exit(1)
  }

  let config = store.get('config')

  try {
    // Initial context object
    let ctx = {
      ipfsd: await createDaemon(config)
    }

    /// Update the path if it was blank previously.
    // This way we use the default path when it is
    // not set.
    if (config.path === '') {
      config.path = ctx.ipfsd.repoPath
      store.set('config', config)
    }

    // Initialize windows. These can add properties to context
    await startupMenubar(ctx)

    // Register hooks
    await registerHooks(ctx)
  } catch (e) {
    if (e.message === 'exit') {
      app.exit(1)
    } else {
      showErrorMessage(e)
    }
  }
}

run()
