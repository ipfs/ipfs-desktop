var BrowserWindow = require('browser-window')
var path = require('path')
var config = require('./../config')

exports = module.exports = errorPanel

function errorPanel (err) {
  var errorWindow = new BrowserWindow(config.window)

  errorWindow.loadUrl('file://' + path.resolve(__dirname, '../views/help.html'))
  errorWindow.webContents.on('did-finish-load', function () {
    errorWindow.webContents.send('err', err.toString())
  })
}
