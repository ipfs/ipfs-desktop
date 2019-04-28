import { app, shell } from 'electron'
import i18n from 'i18next'
import dialog from './dialog'

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

export function criticalErrorDialog (e) {
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

export function recoverableErrorDialog (e) {
  const option = dialog({
    title: i18n.t('recoverableErrorDialog.title'),
    message: i18n.t('recoverableErrorDialog.message'),
    type: 'error',
    buttons: [
      i18n.t('close'),
      i18n.t('reportTheError'),
      i18n.t('openLogs')
    ]
  })

  if (option === 1) {
    shell.openExternal(`https://github.com/ipfs-shipyard/ipfs-desktop/issues/new?body=${encodeURI(issueTemplate(e))}`)
  } else if (option === 2) {
    shell.openItem(app.getPath('userData'))
  }
}
