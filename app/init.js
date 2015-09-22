var menubar = require('menubar')
var BrowserWindow = require('browser-window')
var fs = require('fs')
var ipfsd = require('ipfsd-ctl')

require('electron-debug')()
require('crash-reporter').start()

var config = require('./config')
var errorPanel = require('./controls/error-panel')

// only place where app is used directly
var IPFS
var ipc

exports = module.exports = init

function init () {
  // main entry point
  ipfsd.local(function (err, node) {
    if (err) {
      errorPanel(err)
    }

    var mbConfig = {
      dir: __dirname,
      width: config['menu-bar'].width,
      height: config['menu-bar'].height,
      index: 'http://localhost:3000/menubar.html',
      icon: config['tray-icon'],
      'always-on-top': process.env.NODE_ENV !== 'production',
      preloadWindow: true,
      resizable: false,
      'web-preferences': {
        'web-security': false
      }
    }

    if (process.env.NODE_ENV === 'production') {
      mbConfig.index = 'file://' + __dirname + '/menubar.html'
    }

    var mb = menubar(mbConfig)

    mb.on('ready', function () {
      // Safe ipc calls
      ipc = require('electron-safe-ipc/host')

      // listen for global shortcuts events
      require('./controls/shortcuts')

      // -- load the controls

      var dragDrop = require('./controls/drag-drop')
      var altMenu = require('./controls/alt-menu')
      require('./controls/open-browser')
      require('./controls/open-console')
      require('./controls/open-settings')

      // tray actions

      mb.tray.on('drop-files', dragDrop)
      mb.tray.on('click', altMenu)

      startTray(node)

      if (!node.initialized) {
        initialize(config['ipfs-path'], node)
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
          if (err) {
            throw err
          }
          ipc.send('version', res)
        })

        if (node.initialized) {
          let status = 'stopped'

          if (node.daemonPid()) {
            status = 'running'
          }

          ipc.send('node-status', status)
        }
      })

      ipc.on('start-daemon', function () {
        ipc.send('node-status', 'starting')
        node.startDaemon(function (err, ipfsNode) {
          if (err) {
            throw err
          }
          ipc.send('node-status', 'running')

          poll = setInterval(function () {
            if (mb.window.isVisible()) {
              pollStats(ipfsNode)
            }
          }, 1000)

          IPFS = ipfsNode
        })
      })

      ipc.on('stop-daemon', function () {
        ipc.send('node-status', 'stopping')
        if (poll) {
          delete statsCache.peers
          ipc.send('stats', statsCache)
          clearInterval(poll)
          poll = null
        }

        node.stopDaemon(function (err) {
          if (err) {
            throw err
          }
          IPFS = null
          ipc.send('node-status', 'stopped')
          ipc.send('stats', statsCache)
        })
      })

      ipc.on('shutdown', function () {
        if (IPFS) {
          ipc.send('stop-daemon')
          ipc.once('node-status', function (status) {
            process.exit(0)
          })
        } else {
          process.exit(0)
        }
      })

      var pollStats = function (ipfs) {
        ipfs.swarm.peers(function (err, res) {
          if (err) {
            throw err
          }
          statsCache.peers = res.Strings.length
          ipc.send('stats', statsCache)
        })
      }
    }
  })

  // Initalize a new IPFS node

  function initialize (path, node) {
    var welcomeWindow = new BrowserWindow(config.window)

    if (process.env.NODE_ENV === 'production') {
      welcomeWindow.loadUrl('file://' + __dirname + '/welcome.html')
    } else {
      welcomeWindow.loadUrl('http://localhost:3000/welcome.html')
    }

    welcomeWindow.webContents.on('did-finish-load', function () {
      ipc.send('default-directory', path)
    })

    // wait for msg from frontend
    ipc.on('initialize', function (opts) {
      ipc.send('initializing')
      node.init(opts, function (err, res) {
        if (err) {
          ipc.send('initialization-error', err + '')
        } else {
          ipc.send('initialization-complete')
          ipc.send('node-status', 'stopped')
          fs.writeFileSync(config['ipfs-path-file'], path)
        }
      })
    })
  }
}

exports.getIPFS = function () {
  return IPFS
}
