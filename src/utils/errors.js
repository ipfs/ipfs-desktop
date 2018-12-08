import { app, dialog, shell } from 'electron'

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

export function showErrorMessage (e) {
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

export function showConnFailureErrorMessage (path, addr) {
  const option = dialog.showMessageBox({
    type: 'warning',
    title: 'IPFS Desktop',
    message: `IPFS Desktop failed to connect to an existing ipfs api at ${addr}. This can happen if you run 'ipfs daemon' manually and it has not shutdown cleanly. Would you like to try running 'ipfs repo fsck' to remove the lock and api files from ${path} and try again?`,
    buttons: [
      'No, just quit',
      'Yes, run "ipfs repo fsck"'
    ],
    cancelId: 0
  })

  return option === 1
}
