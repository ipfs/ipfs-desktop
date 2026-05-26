const { app, shell } = require('electron')
const path = require('path')
const os = require('os')
const i18n = require('i18next')
const dialog = require('./dialog')

// GitHub responds HTTP 414 (URI too long) on the issue-creation form around
// 8200 chars; 8000 leaves headroom for request line and headers.
const MAX_URL_LENGTH = 8000

// When forced to truncate, keep more from the tail than the head: daemon
// migration logs wrapped in `new Error(logs)` (see daemon/migration-prompt.js)
// put the real cause on the last lines (see issue #3147).
const TRUNCATION_STEPS = [
  [5, 30],
  [3, 25],
  [2, 20],
  [1, 15],
  [1, 10],
  [0, 8],
  [0, 5],
  [0, 3]
]

const issueTitle = (e) => {
  const stack = e && e.stack ? e.stack.toString() : 'unknown error, no stacktrace'
  const newlineIdx = stack.indexOf('\n')
  const lineEnd = newlineIdx === -1 ? stack.length : newlineIdx
  const firstLine = stack.slice(0, Math.min(lineEnd, 72))
  return `[gui error report] ${firstLine}`
}

const issueTemplate = (stack) => `<!-- 👉️ Please describe HERE what you were doing when this error happened. -->

- **Desktop**: ${app.getVersion()}
- **OS**: ${os.platform()} ${os.release()} ${os.arch()}
- **Electron**: ${process.versions.electron}
- **Chrome**: ${process.versions.chrome}

\`\`\`
${stack}
\`\`\`
`

function truncateStack (stack, headLines, tailLines) {
  const lines = stack.split('\n')
  if (lines.length <= headLines + tailLines) return stack
  const head = lines.slice(0, headLines)
  const tail = lines.slice(lines.length - tailLines)
  const omitted = lines.length - headLines - tailLines
  return [
    ...head,
    `... ${omitted} lines omitted ...`,
    ...tail
  ].join('\n')
}

function buildBugReportUrl (title, body) {
  return `https://github.com/ipfs/ipfs-desktop/issues/new?labels=kind%2Fbug%2C+need%2Ftriage&template=bug_report.md&title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`
}

// Returns an issue-creation URL within MAX_URL_LENGTH. Tries the full stack
// first, then shrinks via head+tail truncation, always preserving the tail.
function generateBugReportUrl (e) {
  const title = issueTitle(e)
  const stack = e && e.stack ? e.stack.toString() : 'unknown error, no stacktrace'

  let url = buildBugReportUrl(title, issueTemplate(stack))
  if (url.length <= MAX_URL_LENGTH) return url

  for (const [h, t] of TRUNCATION_STEPS) {
    url = buildBugReportUrl(title, issueTemplate(truncateStack(stack, h, t)))
    if (url.length <= MAX_URL_LENGTH) return url
  }

  return url.slice(0, MAX_URL_LENGTH)
}

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
  return generateBugReportUrl(e)
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
