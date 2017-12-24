import {ipcMain} from 'electron'

export default function (opts) {
  const {userSettings, send} = opts

  ipcMain.on('set-setting', (event, key, value) => {
    userSettings.set(key, value)
  })

  ipcMain.on('get-setting', (event, key) => {
    send(key, userSettings.get(key))
  })
}
