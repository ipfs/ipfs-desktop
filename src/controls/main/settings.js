import {join} from 'path'
import {shell, ipcMain} from 'electron'
import { store } from '../../utils'

function openNodeConfig () {
  return () => {
    const path = store.get('ipfs').path
    shell.openItem(join(path, 'config'))
  }
}

function updateSettings () {
  return (_, key, value) => {
    store.set(key, value)
  }
}

export default function (opts) {
  const { send } = opts

  const handler = () => {
    send('settings', store.store)
  }

  ipcMain.on('request-settings', handler)
  // TODO: settingsStore.on('change', handler) ?
  ipcMain.on('update-setting', updateSettings(opts))
  ipcMain.on('open-node-settings', openNodeConfig(opts))
}
