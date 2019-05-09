import { ipcMain } from 'electron'
import { store } from '../utils'

export function createToggler ({ webui }, settingsOption, activate) {
  ipcMain.on('config.toggle', async (_, opt) => {
    if (opt !== settingsOption) {
      return
    }

    const oldValue = store.get(settingsOption, null)
    const newValue = !oldValue

    if (await activate(newValue, oldValue)) {
      store.set(settingsOption, newValue)
    }

    webui.webContents.send('config.changed', store.store)
  })
}
