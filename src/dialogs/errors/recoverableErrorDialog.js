const path = require('path')

const i18n = require('i18next')

const generateErrorIssueUrl = require('../../github/generateErrorIssueUrl')
const { dialog } = require('../dialog')
const { app, shell } = require('electron')

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

  dialog(cfg).then((option) => {
    if (option === 1) {
      shell.openExternal(generateErrorIssueUrl(e))
    } else if (option === 2) {
      shell.openPath(path.join(app.getPath('userData'), 'combined.log'))
    }
  }).catch((err) => {
    console.error('Unexpected error when attempting to display dialog', cfg, err)
  })
}

module.exports = { recoverableErrorDialog }
