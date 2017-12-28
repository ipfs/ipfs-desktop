import {join} from 'path'
import {shell, ipcMain} from 'electron'

function openNodeConfig (opts) {
  const {settingsStore} = opts

  return () => {
    const path = settingsStore.get('ipfsPath')
    shell.openExternal(join(path, 'config'))
  }
}

function updateSettings (opts) {
  const {settingsStore} = opts

  return (event, key, value) => {
    settingsStore.set(key, value)
  }
}

export default function (opts) {
  const {send, settingsStore} = opts

  const handler = () => {
    send('settings', settingsStore.toObject())
  }

  ipcMain.on('request-settings', handler)
  settingsStore.on('change', handler)
  ipcMain.on('update-setting', updateSettings(opts))
  ipcMain.on('open-node-settings', openNodeConfig(opts))
}
