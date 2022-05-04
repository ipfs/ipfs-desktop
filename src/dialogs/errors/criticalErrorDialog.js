// @ts-check
const i18n = require('i18next')

const electron = require('../../electronModulesAfterAppReady')
const generateErrorIssueUrl = require('../../github/generateErrorIssueUrl')

let hasErrored = false

async function criticalErrorDialog (e) {
  if (hasErrored) return
  hasErrored = true
  const { dialog } = require('../dialog')
  await dialog({
    title: i18n.t('ipfsDesktopHasShutdownDialog.title'),
    message: i18n.t('ipfsDesktopHasShutdownDialog.message'),
    type: 'error',
    buttons: [
      i18n.t('restartIpfsDesktop'),
      i18n.t('close'),
      i18n.t('reportTheError')
    ]
  }).then(async (option) => {
    const { app, shell } = await electron
    if (option === 0) {
      app.relaunch()
    } else if (option === 2) {
      shell.openExternal(generateErrorIssueUrl(e))
    }

    app.exit(1)
  })
}

module.exports = criticalErrorDialog
