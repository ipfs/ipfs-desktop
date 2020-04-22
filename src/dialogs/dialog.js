const { dialog } = require('electron')
const i18n = require('i18next')
const { IS_MAC } = require('../common/consts')
const dock = require('../utils/dock')

// NOTE: always send the buttons in the order [OK, Cancel, ...Actions].
// See this post for more interesting information about the topic:
// https://medium.muz.li/ok-key-and-cancel-key-which-one-should-be-set-up-on-the-left-4780e86c16eb
module.exports = function ({
  title, message, type = 'info', showDock = true, buttons = [
    i18n.t('ok'),
    i18n.t('cancel')
  ], ...opts
}) {
  const options = {
    type: type,
    buttons: buttons,
    noLink: true,
    ...opts
  }

  if (IS_MAC) {
    options.message = title
    options.detail = message
  } else {
    options.title = title
    options.message = message
  }

  const isInverse = !IS_MAC

  if (isInverse) {
    options.buttons.reverse()
  }

  if (buttons.length > 1) {
    options.defaultId = isInverse ? buttons.length - 1 : 0
    options.cancelId = isInverse ? buttons.length - 2 : 1
  }

  if (showDock) dock.show()
  const selected = dialog.showMessageBoxSync(options)
  if (showDock) dock.hide()

  if (!isInverse) {
    return selected
  }

  return buttons.length - selected - 1
}
