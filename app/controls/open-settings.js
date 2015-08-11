var ipc = require('ipc')
var BrowserWindow = require('browser-window')
var path = require('path')
var config = require('./../config')
// var init = require('./../init')

ipc.on('open-settings', openSettings)

function openSettings () {
  var settingsWindow = new BrowserWindow(config.window)

  settingsWindow.loadUrl('file://' + path.resolve(__dirname, '../views/settings.html'))
  settingsWindow.webContents.on('did-finish-load', function () {})
}
