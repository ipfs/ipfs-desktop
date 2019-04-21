import { ipcMain } from 'electron'
import { store } from '../utils'

export function createToggler ({ webui }, settingsOption, activate) {
  ipcMain.on('config.toggle', async (_, opt) => {
    if (opt !== settingsOption) {
      return
    }

    if (await activate(store.get(settingsOption))) {
      store.set(settingsOption, !store.get(settingsOption))
    }

    webui.webContents.send('config.changed', store.store)
  })
}
