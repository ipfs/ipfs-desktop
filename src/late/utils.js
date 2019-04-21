import { store } from '../utils'
import { ipcMain } from 'electron'

export function createToggler ({ webui }, settingsOption, activate) {
  ipcMain.on('config.toggle', (_, opt) => {
    if (opt !== settingsOption) {
      return
    }

    if (activate(store.get(settingsOption))) {
      store.set(settingsOption, !store.get(settingsOption))
    }

    webui.webContents.send('config.changed', store.store)
  })
}
