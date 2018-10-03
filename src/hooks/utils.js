import { store } from '../utils'
import { ipcMain } from 'electron'

export function createToggler ({ send }, hook, settingsOption, activate) {
  ipcMain.on(hook, () => {
    store.set(settingsOption, !store.get(settingsOption))
    activate(store.get(settingsOption))
    send('config.changed', store.store)
  })
}
