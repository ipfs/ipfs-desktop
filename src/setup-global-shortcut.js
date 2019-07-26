import { globalShortcut, ipcMain } from 'electron'
import createToggler from './create-toggler'
import logger from './common/logger'
import store from './common/store'
import { IS_MAC } from './common/consts'

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

  activate(store.get(settingsOption, false))
  createToggler(ctx, settingsOption, activate)

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
