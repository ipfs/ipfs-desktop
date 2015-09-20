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
      'always-on-top': true
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
          ipc.emit('version', res)
        })

        if (node.initialized) {
          ipc.emit('node-status', 'stopped')
        }
      })

      ipc.on('start-daemon', function () {
        ipc.emit('node-status', 'starting')
        node.startDaemon(function (err, ipfsNode) {
          if (err) {
            throw err
          }
          ipc.emit('node-status', 'running')

          poll = setInterval(function () {
            if (mb.window.isVisible()) {
              pollStats(ipfsNode)
            }
          }, 1000)

          IPFS = ipfsNode
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
          if (err) {
            throw err
          }
          IPFS = null
          ipc.emit('node-status', 'stopped')
          ipc.emit('stats', statsCache)
        })
      })

      ipc.on('shutdown', function () {
        if (IPFS) {
          ipc.emit('stop-daemon')
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
          ipc.emit('stats', statsCache)
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
          fs.writeFileSync(config['ipfs-path-file'], path)
        }
      })
    })
  }
}

exports.getIPFS = function () {
  return IPFS
}
