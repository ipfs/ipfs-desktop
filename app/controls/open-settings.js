import ipc from 'electron-safe-ipc/host'
import config from './../config'

const BrowserWindow = require('browser-window')

function openSettings () {
  const settingsWindow = new BrowserWindow(config.window)

  settingsWindow.loadURL(config.urls.settings)

  settingsWindow.webContents.on('did-finish-load', () => {})
}

ipc.on('open-settings', openSettings)
