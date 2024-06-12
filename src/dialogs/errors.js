const { app, shell } = require('electron')
const path = require('path')
const os = require('os')
const i18n = require('i18next')
const dialog = require('./dialog')

const issueTitle = (e) => {
  const es = e.stack ? e.stack.toString() : 'unknown error, no stacktrace'
  const firstLine = es.substr(0, Math.min(es.indexOf('\n'), 72))
  return `[gui error report] ${firstLine}`
}

const issueTemplate = (e) => `👉️ Please describe what you were doing when this error happened.

**Specifications**

- **OS**: ${os.platform()} ${os.release()}
- **IPFS Desktop Version**: ${app.getVersion()}
- **Electron Version**: ${process.versions.electron}
- **Chrome Version**: ${process.versions.chrome}

**Error**

\`\`\`
${e.stack}
\`\`\`
`

let hasErrored = false

function generateErrorIssueUrl (e) {
  // Check if error is one we have FAQ for
  if (e && e.stack) {
    const stack = e.stack
    switch (true) {
      case stack.includes('repo.lock'):
        return 'https://github.com/ipfs/ipfs-desktop?tab=readme-ov-file#i-got-a-repolock-error-how-do-i-resolve-this'
      case stack.includes('Error fetching'):
        return 'https://github.com/ipfs/ipfs-desktop?tab=readme-ov-file#i-got-a-network-error-eg-error-fetching-what-should-i-do'
      case stack.includes('private key in config does not match id'):
        return 'https://github.com/ipfs/ipfs-desktop/issues/2821#issuecomment-2163117586'
      case stack.includes('process cannot access the file because it is being used by another process'):
        return 'https://github.com/ipfs/ipfs-desktop/issues/2120#issuecomment-1114817009'
    }
  }
  // Something else, prefill new issue form with error details
  return `https://github.com/ipfs/ipfs-desktop/issues/new?labels=kind%2Fbug%2C+need%2Ftriage&template=bug_report.md&title=${encodeURI(issueTitle(e))}&body=${encodeURI(issueTemplate(e))}`.substring(0, 1999)
}

/**
 * This will fail and throw another application error if electron hasn't booted up properly.
 * @param {Error} e
 * @returns
 */
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
    shell.openExternal(generateErrorIssueUrl(e))
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
    shell.openExternal(generateErrorIssueUrl(e))
  } else if (option === 2) {
    shell.openPath(path.join(app.getPath('userData'), 'combined.log'))
  }
}

module.exports = Object.freeze({
  criticalErrorDialog,
  recoverableErrorDialog,
  generateErrorIssueUrl
})
