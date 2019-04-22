import { app, dialog, shell } from 'electron'
import i18n from 'i18next'
import os from 'os'

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

let hasErrored = false

export function showRecoverableError (e) {
  if (app.dock) app.dock.show()

  let options = {
    type: 'error',
    buttons: [
      'Close',
      'Report the error',
      'Open logs'
    ],
    cancelId: 0
  }

  if (os.platform() === 'darwin') {
    options.message = i18n.t('anErrorHasOccurred')
    options.detail = i18n.t('anUnexpectedErrorHasOccurred')
  } else {
    options.title = i18n.t('anErrorHasOccurred')
    options.message = i18n.t('anUnexpectedErrorHasOccurred')
  }

  const option = dialog.showMessageBox(options)

  if (option === 1) {
    shell.openExternal(`https://github.com/ipfs-shipyard/ipfs-desktop/issues/new?body=${encodeURI(issueTemplate(e))}`)
  } else if (option === 2) {
    shell.openItem(app.getPath('userData'))
  }

  if (app.dock) app.dock.hide()
}

export function showErrorMessage (e) {
  if (hasErrored) return
  hasErrored = true

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

export function cannotConnectToAPI (addr) {
  if (hasErrored) return
  hasErrored = true

  const option = dialog.showMessageBox({
    type: 'error',
    title: 'Cannot connect to API',
    message: `IPFS Desktop cannot connect to the API address provided: ${addr}.`,
    buttons: [
      'Close',
      'Restart the app'
    ],
    cancelId: 0
  })

  if (option === 1) {
    app.relaunch()
  }

  app.exit(1)
}
