import { globalShortcut, ipcMain } from 'electron'
import store from './store'
import logger from './logger'
import createToggler from './create-toggler'

// This function registers a global shortcut/accelerator with a certain action
// and (de)activates it according to its 'settingsOption' value on settings.
export default function (ctx, { settingsOption, accelerator, action }) {
  const activate = (value, oldValue) => {
    if (value === oldValue) return

    if (value === true) {
      globalShortcut.register(accelerator, action)
      logger.info(`[${settingsOption}] shortcut enabled`)
    } else {
      globalShortcut.unregister(accelerator)
      logger.info(`[${settingsOption}] shortcut disabled`)
    }

    return true
  }

  // This two listeners allow the same shortcut to be used globally and
  // within the menubar app. For some weird reason, we need to unregister
  // the option before opening the menubar. Otherwise, pressing the shortcut
  // with the menubar open won't take any effect until the user closes the menubar.
  ipcMain.on('menubar-will-open', () => {
    if (store.get(settingsOption, false)) {
      globalShortcut.unregister(accelerator)
    }
  })

  // This extravaganza allows us to have options with shortcuts on the menubar
  // that are equivalent to global shortcuts.
  ipcMain.on('menubar-will-close', () => {
    if (store.get(settingsOption, false)) {
      globalShortcut.register(accelerator, action)
    }
  })

  activate(store.get(settingsOption, false))
  createToggler(ctx, settingsOption, activate)
}
