import ipc from 'electron-safe-ipc/host'
import path from 'path'
import config from './../config'

const BrowserWindow = require('browser-window')

function openSettings () {
  const settingsWindow = new BrowserWindow(config.window)

  if (process.env.NODE_ENV === 'production') {
    settingsWindow.loadUrl('file://' + path.resolve(__dirname, '../settings.html'))
  } else {
    settingsWindow.loadUrl('http://localhost:3000/settings.html')
  }

  settingsWindow.webContents.on('did-finish-load', () => {})
}

ipc.on('open-settings', openSettings)
