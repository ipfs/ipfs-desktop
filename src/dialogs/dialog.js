import { app, dialog } from 'electron'
import i18n from 'i18next'
import os from 'os'

// NOTE: always send the buttons in the order [OK, Cancel, ...Actions].
// See this post for more interesting information about the topic:
// https://medium.muz.li/ok-key-and-cancel-key-which-one-should-be-set-up-on-the-left-4780e86c16eb
export default function ({ title, message, type = 'info', buttons = [
  i18n.t('ok'),
  i18n.t('cancel')
], ...opts }) {
  let options = {
    type: type,
    buttons: buttons,
    noLink: true,
    ...opts
  }

  if (os.platform() === 'darwin') {
    options.message = title
    options.detail = message
  } else {
    options.title = title
    options.message = message
  }

  const isInverse = os.platform() === 'windows' ||
    os.platform() === 'linux'

  if (isInverse) {
    options.buttons.reverse()
  }

  if (buttons.length > 1) {
    options.defaultId = isInverse ? buttons.length - 1 : 0
    options.cancelId = isInverse ? buttons.length - 2 : 1
  }

  if (app.dock) app.dock.show()
  const selected = dialog.showMessageBox(options)
  if (app.dock) app.dock.hide()

  if (!isInverse) {
    return selected
  }

  return buttons.length - selected - 1
}
