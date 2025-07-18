const { dialog } = require('electron')
const i18n = require('i18next')
const { IS_MAC } = require('../common/consts')
const dock = require('../utils/dock')

/**
 * @typedef {object} MessageBoxOptions
 * @property {string} title
 * @property {string} message
 * @property {'none'|'info'|'error'|'question'|'warning'} [type='info']
 * @property {boolean} [showDock=true]
 * @property {string[]} [buttons]
 * @property {boolean} [noLink]
 */

/**
 * Show a message box with the specified options.
 *
 * @param {MessageBoxOptions} options
 * @returns {number}
 */

// NOTE: always send the buttons in the order [OK, Cancel, ...Actions].
// See this post for more interesting information about the topic:
// https://medium.muz.li/ok-key-and-cancel-key-which-one-should-be-set-up-on-the-left-4780e86c16eb
module.exports = function ({
  title, message, type = 'info', showDock = true, buttons = [
    i18n.t('ok'),
    i18n.t('cancel')
  ], ...opts
}) {
  const isInverse = !IS_MAC
  const defaultId = isInverse ? buttons.length - 1 : 0
  const cancelId = isInverse ? buttons.length - 2 : 1

  const options = {
    type,
    buttons: isInverse ? buttons.reverse() : buttons,
    noLink: true,
    title: IS_MAC ? undefined : title,
    message: IS_MAC ? title : message,
    detail: IS_MAC ? message : undefined,
    default: buttons.length > 1 ? defaultId : undefined,
    cancelId: buttons.length > 1 ? cancelId : undefined,
    ...opts
  }

  if (showDock) { dock.show() }
  const selected = dialog.showMessageBoxSync(options)
  if (showDock) { dock.hide() }

  if (!isInverse) {
    return selected
  }

  return buttons.length - selected - 1
}
