var menubar = require('menubar')
var BrowserWindow = require('browser-window')
var app = require('app')
var fs = require('fs')
var path = require('path')
var os = require('os')
var ipfsd = require('ipfsd-ctl')
var ipc = require('ipc')
var open = require('open')
var config = require('./config')
var errorPanel = require('./controls/error-panel')

var multiaddr = require('multiaddr')
var WEBUIPATH = '/webui'

var LOGO = path.resolve(__dirname, '../node_modules/ipfs-logo/ipfs-logo-256-ice.png')

var TRAY_ICON = (os.platform() !== 'darwin' ? LOGO
                 : path.resolve(__dirname, '../node_modules/ipfs-logo/platform-icons/osx-menu-bar.png'))

// only place where app is used directly
var IPFS_PATH_FILE = app.getDataPath() + '/ipfs-electron-app-node-path'

var Ipfs

// main entry point
ipfsd.local(function (err, node) {
  if (err) {
    errorPanel(err)
  }

  var mb = menubar({
    dir: __dirname,
    width: config['menu-bar-width'],
    index: 'file://' + __dirname + '/views/menubar.html',
    show: false,
    frame: false,
    type: 'toolbar',
    icon: TRAY_ICON
  })

  mb.on('ready', function () {
    var pathIPFS

    // find where we saved our ipfs home, or fallback to default
    try {
      pathIPFS = fs.readFileSync(IPFS_PATH_FILE, 'utf-8')
    } catch (e) {
      pathIPFS = process.env.IPFS_PATH ||
        (process.env.HOME || process.env.USERPROFILE) + '/.ipfs'
    }

    startTray(node)

    if (!node.initialized) {
      initialize(pathIPFS, node)
    }

    // keep the menu the right size
    ipc.on('menu-height', function (height) {
      mb.window.setSize(config['menu-bar-width'], height)
    })
  })

  var startTray = function (node) {
    var poll
    var statsCache = {}

    ipc.on('request-state', function (event) {
      ipfsd.version(function (err, res) {
        if (err) throw err
        ipc.emit('version', res)
      })

      if (node.initialized) {
        ipc.emit('node-status', 'stopped')
      }
    })

    ipc.on('start-daemon', function () {
      ipc.emit('node-status', 'starting')
      node.startDaemon(function (err, ipfs) {
        if (err) throw err
        ipc.emit('node-status', 'running')

        poll = setInterval(function () {
          if (mb.window.isVisible()) {
            pollStats(ipfs)
          }
        }, 500)

        Ipfs = ipfs
      })
    })

    ipc.on('stop-daemon', function () {
      ipc.emit('node-status', 'stopping')
      if (poll) {
        delete statsCache.peers
        ipc.emit('stats', statsCache)
        clearInterval(poll)
        poll = null
      }

      node.stopDaemon(function (err) {
        if (err) throw err
        ipc.emit('node-status', 'stopped')
        ipc.emit('stats', statsCache)
      })
    })

    ipc.on('open-console', openConsole)
    ipc.on('open-browser', openBrowser)

    var pollStats = function (ipfs) {
      ipc.emit('stats', statsCache)
      ipfs.swarm.peers(function (err, res) {
        if (err) throw err
        statsCache.peers = res.Strings.length
      })
    }
  }
})
/*
function error (err) {
  var errorWindow = new BrowserWindow(config.window)

  errorWindow.loadUrl('file://' + __dirname + '/views/help.html')
  errorWindow.webContents.on('did-finish-load', function () {
    errorWindow.webContents.send('err', err.toString())
  })
}
*/
function initialize (path, node) {
  var welcomeWindow = new BrowserWindow(config.window)

  welcomeWindow.loadUrl('file://' + __dirname + '/views/welcome.html')

  welcomeWindow.webContents.on('did-finish-load', function () {
    ipc.emit('default-directory', path)
  })

  // wait for msg from frontend
  ipc.on('initialize', function (opts) {
    ipc.emit('initializing')
    node.init(opts, function (err, res) {
      if (err) {
        ipc.emit('initialization-error', err + '')
      } else {
        ipc.emit('initialization-complete')
        ipc.emit('node-status', 'stopped')
        fs.writeFileSync(IPFS_PATH_FILE, path)
      }
    })
  })
}

// --

function apiAddrToUrl (apiAddr) {
  var parts = multiaddr(apiAddr).nodeAddress()
  var url = 'http://' + parts.address + ':' + parts.port + WEBUIPATH
  return url
}

function openConsole () {
  if (Ipfs) {
    Ipfs.config.get('Addresses.API', function (err, res) {
      if (err) { // error should be emited to a error panel
        return console.error(err)
      }
      errorPanel(new Error('YO'))

      var consoleWindow = new BrowserWindow(config.window)
      consoleWindow.loadUrl(apiAddrToUrl(res.Value))
    })
  } else {
    var err = new Error('Cannot open console, IPFS daemon not running')
    console.error(err)
  }
}

function openBrowser (cb) {
  if (Ipfs) {
    Ipfs.config.get('Addresses.API', function (err, res) {
      if (err) { // error should be emited to a error panel
        return console.error(err)
      }

      open(apiAddrToUrl(res.Value))
    })
  } else {
    var err = new Error('Cannot open browser, IPFS daemon not running')
    console.error(err)
  }
}
