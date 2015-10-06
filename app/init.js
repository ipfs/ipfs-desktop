import menubar from 'menubar'
import fs from 'fs'
import ipfsd from 'ipfsd-ctl'
import {join} from 'path'

const dialog = require('dialog')
const BrowserWindow = require('browser-window')

require('electron-debug')()
require('crash-reporter').start()

import {getLocation} from './helpers'
import config from './config'
import errorPanel from './controls/error-panel'
import dragDrop from './controls/drag-drop'
import altMenu from './controls/alt-menu'

// Local Variables

let IPFS
let ipc
let poll
let mb
const statsCache = {}

function pollStats (ipfs) {
  ipfs.swarm.peers((err, res) => {
    if (err) throw err

    statsCache.peers = res.Strings.length
    ipc.send('stats', statsCache)
  })

  ipfs.id((err, peer) => {
    if (err) throw err

    getLocation(ipfs, peer.Addresses, (err, location) => {
      if (err) throw err
      statsCache.location = location && location.formatted
      ipc.send('stats', statsCache)
    })
  })
}

function onRequestState (node, event) {
  ipfsd.version((err, res) => {
    if (err) throw err
    console.log('running %s', res)
    ipc.send('version', res)
  })

  if (node.initialized) {
    let status = 'stopped'

    if (node.daemonPid()) {
      status = 'running'
    }

    ipc.send('node-status', status)
  }
}

function onStartDaemon (node) {
  ipc.send('node-status', 'starting')
  node.startDaemon(function (err, ipfsNode) {
    if (err) throw err
    ipc.send('node-status', 'running')

    poll = setInterval(() => {
      if (mb.window && mb.window.isVisible()) {
        pollStats(ipfsNode)
      }
    }, 1000)

    ipc.on('drop-files', dragDrop)
    IPFS = ipfsNode
  })
}

function onStopDaemon (node) {
  ipc.send('node-status', 'stopping')
  if (poll) {
    delete statsCache.peers
    ipc.send('stats', statsCache)
    clearInterval(poll)
    poll = null
  }

  node.stopDaemon(err => {
    if (err) throw err

    IPFS = null
    ipc.send('node-status', 'stopped')
    ipc.send('stats', statsCache)
  })
}

function onShutdown () {
  if (IPFS) {
    ipc.send('stop-daemon')
    ipc.once('node-status', function (status) {
      process.exit(0)
    })
  } else {
    process.exit(0)
  }
}

function startTray (node) {
  ipc.on('request-state', onRequestState.bind(null, node))
  ipc.on('start-daemon', onStartDaemon.bind(null, node))
  ipc.on('stop-daemon', onStopDaemon.bind(null, node))
  ipc.on('shutdown', onShutdown)
}

// Initalize a new IPFS node
function initialize (path, node) {
  const welcomeWindow = new BrowserWindow(config.window)

  welcomeWindow.loadUrl(config.urls.welcome)
  welcomeWindow.webContents.on('did-finish-load', () => {
    ipc.send('setup-config-path', path)
  })

  let userPath = path

  ipc.on('setup-browse-path', () => {
    dialog.showOpenDialog(welcomeWindow, {
      title: 'Select a directory',
      defaultPath: path,
      properties: [
        'openDirectory',
        'createDirectory'
      ]
    }, res => {
      if (!res) return

      userPath = res[0]

      if (!userPath.match(/.ipfs\/?$/)) {
        userPath = join(userPath, '.ipfs')
      }

      ipc.send('setup-config-path', userPath)
    })
  })

  // wait for msg from frontend
  ipc.on('initialize', () => {
    ipc.send('initializing')
    node.init({
      directory: userPath,
      keySize: 4096
    }, (err, res) => {
      if (err) {
        ipc.send('initialization-error', err + '')
      } else {
        ipc.send('initialization-complete')
        ipc.send('node-status', 'stopped')
        fs.writeFileSync(config['ipfs-path-file'], path)
        welcomeWindow.close()
      }
    })
  })
}

export function getIPFS () {
  return IPFS
}

export function start () {
  // main entry point
  ipfsd.local((err, node) => {
    if (err) {
      errorPanel(err)
    }

    mb = menubar(config.menuBar)

    mb.on('ready', () => {
      // Safe ipc calls
      ipc = require('electron-safe-ipc/host')

      // listen for global shortcuts events
      require('./controls/shortcuts')

      // -- load the controls
      require('./controls/open-browser')
      require('./controls/open-console')
      require('./controls/open-settings')

      // tray actions

      mb.tray.on('drop-files', dragDrop)
      mb.tray.on('click', altMenu)

      startTray(node)

      if (!node.initialized) {
        initialize(config['ipfs-path'], node)
      } else {
        // Start up the daemon
        onStartDaemon(node)
      }
    })
  })
}
