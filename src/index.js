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

const issueTemplate = (e) => `Please describe what you were doing when this error happened.

**Specifications**

- **OS**: ${process.platform}
- **IPFS Desktop Version**: ${app.getVersion()}
- **Electron Version**: ${process.versions.electron}
- **Chrome Version**: ${process.versions.chrome}

**Error**

\`\`\`
${e.stack}
\`\`\`
`

function handleError (e) {
  const option = dialog.showMessageBox({
    type: 'error',
    title: 'IPFS Desktop has shutdown',
    message: 'IPFS Desktop has shutdown because of an error. You can restart the app or report the error to the developers, which requires a GitHub account.',
    buttons: [
      'Close',
      'Report the error to the developers',
      'Restart the app'
    ],
    cancelId: 0
  })

  if (option === 1) {
    shell.openExternal(`https://github.com/ipfs-shipyard/ipfs-desktop/issues/new?body=${encodeURI(issueTemplate(e))}`)
  } else if (option === 2) {
    app.relaunch()
  }

  app.exit(1)
}

async function setupConnection () {
  let config = store.get('config')
  let updateCfg = false

  if (config === null) {
    config = { type: 'go' }
    updateCfg = true
  }

  const ipfsd = await createDaemon(config)

  // createDaemon has changed the config object,
  // but didn't add the repo variable.
  if (updateCfg) {
    config.path = ipfsd.repoPath
    store.set('config', config)
  }

  return ipfsd
}

async function run () {
  try {
    await app.whenReady()
  } catch (e) {
    dialog.showErrorBox('Electron could not start', e.stack)
    app.exit(1)
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
