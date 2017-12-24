import {ipcMain} from 'electron'

export default function (opts) {
  const {userSettings} = opts

  ipcMain.on('update-setting', (event, key, value) => {
    userSettings.set(key, value)
  })
}
