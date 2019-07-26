import { ipcMain } from 'electron'
import store from './common/store'

export default function ({ webui }, settingsOption, activate) {
  ipcMain.on('config.toggle', async (_, opt) => {
    if (opt !== settingsOption) {
      return
    }

    const oldValue = store.get(settingsOption, null)
    const newValue = !oldValue
    let success = false

    if (await activate(newValue, oldValue)) {
      store.set(settingsOption, newValue)
      success = true
    }

    webui.webContents.send('config.changed', {
      config: store.store,
      changed: settingsOption,
      success
    })
  })
}
