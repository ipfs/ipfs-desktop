const { globalShortcut, ipcMain } = require('electron')
const createToggler = require('./create-toggler')
const store = require('./common/store')
const { IS_MAC } = require('./common/consts')

// This function registers a global shortcut/accelerator with a certain action
// and (de)activates it according to its 'settingsOption' value on settings.
module.exports = function (ctx, { settingsOption, accelerator, action }) {
  const activate = (value, oldValue) => {
    if (value === oldValue) return

    if (value === true) {
      globalShortcut.register(accelerator, action)
    } else {
      globalShortcut.unregister(accelerator)
    }

    return true
  }

  activate(store.get(settingsOption, false))
  createToggler(settingsOption, activate)

  if (!IS_MAC) {
    return
  }

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
