import { app, logger, dialog } from 'electron'
import { store, setupConnection, showErrorMessage } from './utils'
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

  let config = store.get('ipfsConfig')

  try {
    const ipfsd = await setupConnection()

    app.on('quit', () => {
      ipfsd.stop(err => {
        if (err) return logger.error('Failed to stop IPFS daemon', err)
        logger.log('IPFS daemon stopped')
      })
    })

    // Initial context object
    let ctx = { ipfsd }

    /// Update the path if it was blank previously.
    // This way we use the default path when it is
    // not set.
    if (config.path === '') {
      config.path = ctx.ipfsd.repoPath
      store.set('ipfsConfig', config)
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
