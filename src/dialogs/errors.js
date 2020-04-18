const { app, shell } = require('electron')
const i18n = require('i18next')
const dialog = require('./dialog')

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

function criticalErrorDialog (e) {
  if (hasErrored) return
  hasErrored = true

  const option = dialog({
    title: i18n.t('ipfsDesktopHasShutdownDialog.title'),
    message: i18n.t('ipfsDesktopHasShutdownDialog.message'),
    type: 'error',
    buttons: [
      i18n.t('restartIpfsDesktop'),
      i18n.t('close'),
      i18n.t('reportTheError')
    ]
  })

  if (option === 0) {
    app.relaunch()
  } else if (option === 2) {
    shell.openExternal(`https://github.com/ipfs-shipyard/ipfs-desktop/issues/new?body=${encodeURI(issueTemplate(e))}`)
  }

  app.exit(1)
}

// Shows a recoverable error dialog with the default title and message.
// Passing an options object alongside the error can be used to override
// the title and message.
function recoverableErrorDialog (e, options) {
  const cfg = {
    title: i18n.t('recoverableErrorDialog.title'),
    message: i18n.t('recoverableErrorDialog.message'),
    type: 'error',
    buttons: [
      i18n.t('close'),
      i18n.t('reportTheError'),
      i18n.t('openLogs')
    ]
  }

  if (options) {
    if (options.title) {
      cfg.title = options.title
    }

    if (options.message) {
      cfg.message = options.message
    }
  }

  const option = dialog(cfg)

  if (option === 1) {
    shell.openExternal(`https://github.com/ipfs-shipyard/ipfs-desktop/issues/new?body=${encodeURI(issueTemplate(e))}`)
  } else if (option === 2) {
    shell.openItem(app.getPath('userData'))
  }
}

module.exports = Object.freeze({
  criticalErrorDialog,
  recoverableErrorDialog
})
