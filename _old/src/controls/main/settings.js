import { join } from 'path'
import { shell, ipcMain, app, dialog } from 'electron'
import { store } from '../../utils'

const openNodeConfig = () => {
  const path = store.get('ipfs').path
  shell.openItem(join(path, 'config'))
}

const settingsToSend = {
  direct: [
    'autoLaunch',
    'screenshotShortcut',
    'downloadHashShortcut',
    'lightTheme'
  ],
  flags: {
    dhtClient: '--routing=dhtclient'
  }
}

const sendSettings = ({ send }) => () => {
  const options = {}

  for (const opt of settingsToSend.direct) {
    options[opt] = store.get(opt, false)
  }

  const flags = store.get('ipfs.flags', [])

  for (const flag of Object.keys(settingsToSend.flags)) {
    options[flag] = flags.includes(settingsToSend.flags[flag])
  }

  send('settings', options)
}

const updateSettings = (opts) => (_, key, value) => {
  if (settingsToSend.direct.includes(key)) {
    store.set(key, value)
    return sendSettings(opts)()
  }

  const flags = store.get('ipfs.flags')
  const flag = settingsToSend.flags[key]
  const index = flags.indexOf(flag)

  if (value) {
    if (index === -1) {
      flags.push(flag)
    }
  } else {
    if (index !== -1) {
      flags.splice(index, 1)
    }
  }

  store.set('ipfs.flags', flags)
  sendSettings(opts)()
}

const cleanIpfsSettings = () => {
  store.delete('ipfs')
  dialog.showMessageBox({
    type: 'info',
    message: 'The IPFS settings were cleared and IPFS Desktop will shutdown now. You need to start it again afterwards.'
  }, () => {
    app.quit()
  })
}

export default function (opts) {
  ipcMain.on('request-settings', sendSettings(opts))
  ipcMain.on('update-setting', updateSettings(opts))
  ipcMain.on('open-node-settings', openNodeConfig)
  ipcMain.on('clean-ipfs-settings', cleanIpfsSettings)
}
