const { BrowserWindow } = require('electron')
const i18n = require('i18next')
const { showDialog } = require('../dialogs')

function hideOtherWindows () {
  // Hide other windows so the user focus in on the dialog
  BrowserWindow.getAllWindows().forEach(w => w.hide())
}

/**
 * Dialog to show when the daemon cannot connect to remote API.
 *
 * @param {string} addr
 */
function cannotConnectToApiDialog (addr) {
  hideOtherWindows()
  showDialog({
    title: i18n.t('cannotConnectToApiDialog.title'),
    message: i18n.t('cannotConnectToApiDialog.message', { addr }),
    type: 'error',
    buttons: [
      i18n.t('quit')
    ]
  })
}

/**
 * Dialog to show when there are multiple busy ports.
 *
 * @returns {boolean} open the configuration file
 */
function multipleBusyPortsDialog () {
  hideOtherWindows()
  const opt = showDialog({
    title: i18n.t('multipleBusyPortsDialog.title'),
    message: i18n.t('multipleBusyPortsDialog.message'),
    type: 'error',
    buttons: [
      i18n.t('multipleBusyPortsDialog.action'),
      i18n.t('quit')
    ]
  })

  return opt === 0
}

/**
 * Dialog to show when there is a busy port and we offer an alternative.
 *
 * @param {Number} port is the busy port
 * @param {Number} alt is the alternative free port
 * @returns {boolean} use the alternative port
 */
function busyPortDialog (port, alt) {
  hideOtherWindows()
  const opt = showDialog({
    title: i18n.t('busyPortDialog.title'),
    message: i18n.t('busyPortDialog.message', { port, alt }),
    type: 'error',
    buttons: [
      i18n.t('busyPortDialog.action', { port, alt }),
      i18n.t('quit')
    ]
  })

  return opt === 0
}

/**
 * Dialog to show when there are two busy ports and we offer an alternative.
 *
 * @param {Number} port1 is the busy port 1
 * @param {Number} alt1 is the alternative free port 1
 * @param {Number} port2 is the busy port 2
 * @param {Number} alt2 is the alternative free port 2
 * @returns {boolean} use the alternative port
 */
function busyPortsDialog (port1, alt1, port2, alt2) {
  hideOtherWindows()
  const opt = showDialog({
    title: i18n.t('busyPortsDialog.title'),
    message: i18n.t('busyPortsDialog.message', { port1, alt1, port2, alt2 }),
    type: 'error',
    buttons: [
      i18n.t('busyPortsDialog.action', { port1, alt1, port2, alt2 }),
      i18n.t('quit')
    ]
  })

  return opt === 0
}

/**
 * Show the dialog with the text from the i18nKey, using the
 * options opts.
 *
 * @param {string} i18nKey
 * @param {any} opts
 */
function hideWindowsAndShowDialog (i18nKey, opts) {
  hideOtherWindows()
  showDialog({
    title: i18n.t(`${i18nKey}.title`),
    message: i18n.t(`${i18nKey}.message`, opts),
    buttons: [i18n.t('quit')]
  })
}

/**
 * Dialog to show when the repository is part of a private network.
 *
 * @param {string} path
 */
function repositoryIsPrivateDialog (path) {
  hideWindowsAndShowDialog('privateNetworkDialog', { path })
}

/**
 * Dialog to show when we detect that the repository is not a directory.
 *
 * @param {string} path
 */
function repositoryMustBeDirectoryDialog (path) {
  hideWindowsAndShowDialog('repositoryMustBeDirectoryDialog', { path })
}

/**
 * Dialog to show when we detect that the configuration file is missing.
 *
 * @param {string} path
 */
function repositoryConfigurationIsMissingDialog (path) {
  hideWindowsAndShowDialog('repositoryConfigurationIsMissingDialog', { path })
}

/**
 * Dialog to show when we detect that the repository is invalid, but we
 * are not sure what the problem is.
 *
 * @param {string} path
 */
function repositoryIsInvalidDialog (path) {
  hideWindowsAndShowDialog('invalidRepositoryDialog', { path })
}

module.exports = {
  cannotConnectToApiDialog,
  multipleBusyPortsDialog,
  busyPortDialog,
  busyPortsDialog,
  repositoryIsPrivateDialog,
  repositoryMustBeDirectoryDialog,
  repositoryConfigurationIsMissingDialog,
  repositoryIsInvalidDialog
}
