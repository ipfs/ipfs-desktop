var menubar = require('menubar')
var BrowserWindow = require('browser-window')
var app = require('app')

var fs = require('fs')
var path = require('path')

var os = require('os')
var ipfsd = require('ipfsd-ctl')
var ipc = require('ipc')
var open = require('open')

var multiaddr = require('multiaddr')
var WEBUIPATH = '/webui'

var LOGO = path.resolve(__dirname, '../node_modules/ipfs-logo/ipfs-logo-256-ice.png')

var TRAY_ICON = (os.platform() !== 'darwin' ? LOGO
                 : path.resolve(__dirname, '../node_modules/ipfs-logo/platform-icons/osx-menu-bar.png'))

// only place where app is used directly
var IPFS_PATH_FILE = app.getDataPath() + '/ipfs-electron-app-node-path'

var MENU_WIDTH = 240

var mainWindow
var Ipfs

var error = function (err) {
  mainWindow = new BrowserWindow({icon: LOGO,
                                  'auto-hide-menu-bar': true,
                                  width: 800,
                                  height: 600})

  mainWindow.loadUrl('file://' + __dirname + '/views/help.html')
  mainWindow.webContents.on('did-finish-load', function () {
    console.log('in loaded')
    mainWindow.webContents.send('err', err.toString())
  })
}

var initialize = function (path, node) {
  mainWindow = new BrowserWindow({icon: LOGO,
                                  width: 800,
                                  'auto-hide-menu-bar': true,
                                  height: 600})
  mainWindow.loadUrl('file://' + __dirname + '/views/welcome.html')

  mainWindow.webContents.on('did-finish-load', function () {
    console.log('default dir ', path)
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

// main entry point
ipfsd.local(function (err, node) {
  if (err) error(err)

  var mb = menubar({
    dir: __dirname,
    width: MENU_WIDTH,
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
      mb.window.setSize(MENU_WIDTH, height)
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

//

var apiAddrToUrl = function (apiAddr) {
  var parts = multiaddr(apiAddr).nodeAddress()
  var url = 'http://' + parts.address + ':' + parts.port + WEBUIPATH
  return url
}

var openConsole = function (cb) {
  if (Ipfs) {
    Ipfs.config.get('Addresses.API', function (err, res) {
      if (err && cb) return cb(err)
      if (err) throw err

      mainWindow = new BrowserWindow({icon: LOGO, width: 800, height: 600})
      mainWindow.on('closed', function () {
        mainWindow = null
      })
      mainWindow.loadUrl(apiAddrToUrl(res.Value))
      cb && cb()
    })
  } else {
    var err = new Error('Cannot open console, IPFS daemon not running')
    if (err && cb) return cb(err)
    if (err) throw err
  }
}

var openBrowser = function (cb) {
  if (Ipfs) {
    Ipfs.config.get('Addresses.API', function (err, res) {
      if (err && cb) return cb(err)
      if (err) throw err
      open(apiAddrToUrl(res.Value))
      cb && cb()
    })
  } else {
    var err = new Error('Cannot open browser, IPFS daemon not running')
    if (err && cb) return cb(err)
    if (err) throw err
  }
}
