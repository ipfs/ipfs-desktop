// @ts-check
const i18n = require('i18next')

const electron = require('../electronModulesAfterAppReady')
const createToggler = require('./create-toggler')
const store = require('../common/store')
const { IS_MAC } = require('../common/consts')
const { showDialog } = require('../dialogs')

const activate = async ({ newValue, oldValue, feedback, confirmationDialog, accelerator, action }) => {
  if (newValue === oldValue) return

  const { globalShortcut } = await electron

  if (newValue === true) {
    if (feedback && confirmationDialog) {
      const dialogResponse = await showDialog({
        ...confirmationDialog,
        buttons: [
          i18n.t('enable'),
          i18n.t('cancel')
        ]
      })
      if (dialogResponse !== 0) {
        // User canceled
        return
      }
    }
    globalShortcut.register(accelerator, action)
  } else {
    globalShortcut.unregister(accelerator)
  }

  return true
}

// This function registers a global shortcut/accelerator with a certain action
// and (de)activates it according to its 'settingsOption' value on settings.
module.exports = async function ({ settingsOption, accelerator, action, confirmationDialog }) {
  // @TODO: Why are we not passing oldvalue?
  await activate({ newValue: store.get(settingsOption, false), confirmationDialog, accelerator, action })
  createToggler(settingsOption, activate)

  if (!IS_MAC) {
    return
  }
  const { globalShortcut, ipcMain } = await electron

  // On macOS, when registering accelerators in the menubar, we need to
  // unregister them globally before the menubar is open. Otherwise they
  // won't work unless the user closes the menubar.
  ipcMain.on('menubar-will-open', () => {
    if (store.get(settingsOption, false)) {
      globalShortcut.unregister(accelerator)
    }
  })

  ipcMain.on('menubar-will-close', () => {
    if (store.get(settingsOption, false)) {
      globalShortcut.register(accelerator, action)
    }
  })
}
