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

const issueTemplate = (e) => `<!-- 👉️ Please describe HERE what you were doing when this error happened. -->

- **Desktop**: ${app.getVersion()}
- **OS**: ${os.platform()} ${os.release()} ${os.arch()}
- **Electron**: ${process.versions.electron}
- **Chrome**: ${process.versions.chrome}

\`\`\`
${e.stack}
\`\`\`
`

let hasErrored = false

function generateErrorIssueUrl (e) {
  // Check if OS is supported at all
  if (os.platform() === 'win32' && os.release().startsWith('6.1.')) {
    return 'https://github.com/ipfs/ipfs-desktop/issues/2823#issuecomment-2163182898' // Windows 7 EOL
  }
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
      case stack.includes('Error: Exception 0xc0000005 0x8 0x0 0x0'):
        return 'https://github.com/ipfs/ipfs-desktop/issues/2823#issuecomment-2163182898'
      case stack.includes('directory missing SHARDING file'):
        return 'https://github.com/ipfs/ipfs-desktop/issues/2037#issuecomment-1074464701'
      case stack.includes('Error: Your programs version'):
        return 'https://github.com/ipfs/ipfs-desktop?tab=readme-ov-file#error-your-programs-version-n-is-lower-than-your-repos-nx'
      case stack.includes('_SecTrustEvaluateWithError'):
        return 'https://github.com/ipfs/ipfs-desktop/issues/2425#issuecomment-1457250858'
      case stack.includes('config: The system cannot find the path specified'):
        return 'https://github.com/ipfs/ipfs-desktop/issues/2259#issuecomment-1239275950'
      case stack.includes('bind: address already in use'):
        return 'https://github.com/ipfs/ipfs-desktop/issues/2216#issuecomment-1199189648'
      case stack.includes('5001: bind: address already in use'):
        return 'https://github.com/ipfs/ipfs-desktop/issues/2216'
      case stack.includes('Only one usage of each socket address (protocol/network address/port) is normally permitted'):
        return 'https://github.com/ipfs/ipfs-desktop/issues/2932#issuecomment-3083947021'
      case stack.includes('Get-AuthenticodeSignature'):
        return 'https://github.com/ipfs/ipfs-desktop/issues/2335#issuecomment-2161827010'
      case stack.includes('Error: multiaddr "http'):
        return 'https://github.com/ipfs/ipfs-desktop/issues/2092#issuecomment-1088124521'
      case stack.includes('error loading filesroot from dagservice: block was not found locally (offline): ipld: could not find'):
        return 'https://github.com/ipfs/ipfs-desktop/issues/2882#issuecomment-2658038042'
      case stack.includes('no protocol with name: localhost:5001'):
        return 'https://github.com/ipfs/ipfs-desktop/issues/2964#issuecomment-3083882607'
      case stack.includes('failure to decode config: The Experimental.AcceleratedDHTClient key has been moved to Routing.AcceleratedDHTClient'):
        return 'https://github.com/ipfs/ipfs-desktop/issues/2961#issuecomment-3083916364'
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
