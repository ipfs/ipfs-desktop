import {join} from 'path'
import {shell, ipcMain, BrowserWindow} from 'electron'

function setupWindow (opts) {
  const options = opts.settingsWindow
  const window = new BrowserWindow(options)

  window.setMenu(null)
  window.loadURL(options.index)
  window.on('close', (event) => {
    event.preventDefault()
    window.hide()
  })

  // Replace the window settings by the actual
  // instance of BrowserWindow
  opts.settingsWindow = window
}

function open (opts) {
  const {settingsWindow, settingsStore} = opts

  return () => {
    settingsWindow.webContents.send('settings', settingsStore.toObject())
    settingsWindow.show()
    settingsWindow.focus()
  }
}

function openNodeConfig (opts) {
  const {ipfsPath} = opts
  return () => {
    shell.openExternal(join(ipfsPath, 'config'))
  }
}

function updateSettings (opts) {
  const {settingsStore} = opts

  return (event, settings) => {
    for (const key in settings) {
      if (settings.hasOwnProperty(key)) {
        settingsStore.set(key, settings[key])
      }
    }
  }
}

export default function (opts) {
  setupWindow(opts)

  ipcMain.on('open-settings', open(opts))
  ipcMain.on('update-settings', updateSettings(opts))
  ipcMain.on('open-node-settings', openNodeConfig(opts))
}
