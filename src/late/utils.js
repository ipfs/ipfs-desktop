import { ipcMain } from 'electron'
import { execFileSync } from 'child_process'
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

export function hasBin (bin, ...args) {
  try {
    execFileSync(bin, args)
    return true
  } catch (_) {
    return false
  }
}
