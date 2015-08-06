var ipc = require('ipc')
var BrowserWindow = require('browser-window')
var config = require('./../config')
var apiAddrToUrl = require('./utils').apiAddrToUrl
var init = require('./../init')

ipc.on('open-console', openConsole)

function openConsole () {
  if (init.IPFS) {
    init.IPFS.config.get('Addresses.API', function (err, res) {
      if (err) { // TODO() error should be emited to a error panel
        return console.error(err)
      }

      var consoleWindow = new BrowserWindow(config.window)
      consoleWindow.loadUrl(apiAddrToUrl(res.Value))
    })
  } else {
    // TODO() error should be emited to a error panel
    var err = new Error('Cannot open console, IPFS daemon not running')
    console.error(err)
  }
}

