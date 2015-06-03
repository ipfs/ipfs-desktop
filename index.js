'use strict'

var app = require('app')
var BrowserWindow = require('browser-window')
var ipfsd = require('ipfsd-ctl')
var multiaddr = require('multiaddr')
var Tray = require('tray')
var menu = require('menu')

require('crash-reporter').start()

var WEBUIPATH = '/webui'
var LOGO = __dirname + '/node_modules/ipfs-logo/ipfs-logo-256-ice.png'
var mainWindow = null

var wizard = function (err) {
  var wizWindow = new BrowserWindow({icon: LOGO, width: 800, height: 600})
  wizWindow.loadUrl('file://' + __dirname + '/wizard/wizard.html')
  wizWindow.webContents.on('did-finish-load', function () {
    mainWindow.webContents.send('err', err.toString())
  })
}

var apiAddrToUrl = function (apiAddr) {
  var parts = multiaddr(apiAddr).nodeAddress()
  var url = 'http://' + parts.address + ':' + parts.port + WEBUIPATH
  return url
}

var openWindow = function (ipfs) {
  if (!mainWindow) {
    ipfs.config.get('Addresses.API', function (err, res) {
      if (err) throw err
      mainWindow = new BrowserWindow({icon: LOGO, width: 800, height: 600})
      mainWindow.on('closed', function () {
        mainWindow = null
      })
      mainWindow.loadUrl(apiAddrToUrl(res.Value))
    })
  } else {
    mainWindow.show()
  }
}

app.on('ready', function () {
  ipfsd.local(function (err, ipfs) {
    if (err) return wizard(err)

    openWindow(ipfs)

    var appTray = new Tray(LOGO)
    var contextMenu = menu.buildFromTemplate([
      { label: 'Open',
        click: function () { openWindow(ipfs) }
      },
      { type: 'separator' },
      { label: 'Quit',
        click: function () { process.exit(0) }}
    ])
    appTray.setToolTip('IPFS')
    appTray.setContextMenu(contextMenu)
  })
})
