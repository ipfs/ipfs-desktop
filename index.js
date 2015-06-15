'use strict'

var menubar = require('menubar')

var os = require('os')
var ipfsd = require('ipfsd-ctl')
var ipc = require('ipc')

// var multiaddr = require('multiaddr')
// var Tray = require('tray')

// var WEBUIPATH = '/webui'

var LOGO = __dirname + '/node_modules/ipfs-logo/ipfs-logo-256-ice.png'
var TRAY_ICON = (os.platform() !== 'darwin' ? LOGO
                 : __dirname + '/node_modules/ipfs-logo/platform-icons/osx-menu-bar.png')

var opts = {
  'skip-taskbar': true,
  'use-content-size': true,
  dir: __dirname,
  index: 'file://' + __dirname + '/html/menu.html',
  show: false,
  frame: false,
  type: 'toolbar',
  icon: TRAY_ICON
}

var mb = menubar(opts)

mb.on('ready', function () {
  ipfsd.local(function (err, node) {
    if (err) throw err

    ipc.on('request-state', function (event) {
      ipfsd.version(function (err, res) {
        if (err) throw err
        mb.window.webContents.send('version', res)
      })
    })

    ipc.on('start-daemon', function () {
      console.log('start-daemon bekommen')
    })
  })
})

// // keep references around for gc purposes
// var mainWindow = null
// var mainTray = null
// var contextMenu = null

// var Ipfs

// var help = function (err) {
//   mainWindow = new BrowserWindow({icon: LOGO, width: 800, height: 600})
//   mainWindow.loadUrl('file://' + __dirname + '/help/help.html')
//   mainWindow.webContents.on('did-finish-load', function () {
//     mainWindow.webContents.send('err', err.toString())
//   })
// }

// var apiAddrToUrl = function (apiAddr) {
//   var parts = multiaddr(apiAddr).nodeAddress()
//   var url = 'http://' + parts.address + ':' + parts.port + WEBUIPATH
//   return url
// }

// var openBrowser = function () {
// }

// var openConsole = function () {
//   if (!mainWindow) {
//     if (Ipfs) {
//       Ipfs.config.get('Addresses.API', function (err, res) {
//         if (err) throw err

//         mainWindow = new BrowserWindow({icon: LOGO, width: 800, height: 600})
//         mainWindow.on('closed', function () {
//           mainWindow = null
//         })

//         mainWindow.loadUrl(apiAddrToUrl(res.Value))
//       })
//     } else {
//       help()
//     }

//   } else {
//     mainWindow.show()
//   }
// }

// var exit = function () { process.exit(0) }

// app.on('ready', function () {
//   ipfsd.local(function (err, node) {
//     if (err) return help(err)

//     var toggleDaemon = function (state) {
//       if (state.checked) {
//         node.startDaemon(function (err, ipfs) {
//           if (err) return help(err)
//           Ipfs = ipfs
//         })
//       } else {
//         Ipfs = null
//         node.stopDaemon()
//       }
//     }

//     contextMenu = menu.buildFromTemplate([
//       { label: 'Open Console',
//         click: openConsole },
//       { label: 'Console in browser',
//         click: openBrowser },

//       { type: 'separator' },

//       { label: 'run daemon',
//         id: 'runDaemon',
//         click: toggleDaemon,
//         type: 'checkbox'},
//       { label: 'connect to swarm',
//         type: 'checkbox'},
//       { label: 'check for updates ',
//         type: 'checkbox'},

//       { type: 'separator' },

//       { label: 'Exit',
//         click: exit }
//     ])

//     mainTray = new Tray(TRAY_ICON)
//     mainTray.setToolTip('IPFS')
//     mainTray.setContextMenu(contextMenu)
//   })
// })
