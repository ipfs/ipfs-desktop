import { store } from '../utils'
import { ipcMain } from 'electron'

export function createToggler ({ settingsWindow }, settingsOption, activate) {
  ipcMain.on('config.toggle', (_, opt) => {
    if (opt === settingsOption) {
      store.set(settingsOption, !store.get(settingsOption))
      activate(store.get(settingsOption))
      settingsWindow.send('config.changed', store.store)
    }
  })
}
