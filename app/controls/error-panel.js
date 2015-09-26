var BrowserWindow = require('browser-window')
var config = require('./../config')

exports = module.exports = errorPanel

function errorPanel (err) {
  var errorWindow = new BrowserWindow(config.window)

  errorWindow.loadUrl(config.urls.help)

  errorWindow.webContents.on('did-finish-load', function () {
    errorWindow.webContents.send('err', err.toString())
  })
}
