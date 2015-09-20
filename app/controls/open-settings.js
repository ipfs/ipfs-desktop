var ipc = require('electron-safe-ipc/host')
var BrowserWindow = require('browser-window')
var path = require('path')
var config = require('./../config')
// var init = require('./../init')

ipc.on('open-settings', openSettings)

function openSettings () {
  var settingsWindow = new BrowserWindow(config.window)

  if (process.env.NODE_ENV === 'production') {
    settingsWindow.loadUrl('file://' + path.resolve(__dirname, '../settings.html'))
  } else {
    settingsWindow.loadUrl('http://localhost:3000/settings.html')
  }
  settingsWindow.webContents.on('did-finish-load', function () {})
}
