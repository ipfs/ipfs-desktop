import menubar from 'menubar'
import fs from 'fs'
import ipfsd from 'ipfsd-ctl'
import {join} from 'path'
import {lookupPretty} from 'ipfs-geoip'

import config from './config'
import dragDrop from './controls/drag-drop'

const dialog = require('dialog')
const BrowserWindow = require('browser-window')

if (config.isProduction) {
  require('crash-reporter').start()
} else {
  require('electron-debug')()
}

// Local Variables

let IPFS
let ipc
let poll
let mb
let logger
const statsCache = {}

function pollStats (ipfs) {
  ipfs.swarm.peers((err, res) => {
    if (err) throw err

    statsCache.peers = res.Strings.length
    ipc.send('stats', statsCache)
  })

  ipfs.id((err, peer) => {
    if (err) throw err

    lookupPretty(ipfs, peer.Addresses, (err, location) => {
      if (err) throw err
      statsCache.location = location && location.formatted
      ipc.send('stats', statsCache)
    })
  })
}

function onRequestState (node, event) {
  ipfsd.version((err, res) => {
    if (err) throw err
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

    // Get initial stats
    pollStats(ipfsNode)

    IPFS = ipfsNode
  })
}

function onStopDaemon (node, done = () => {}) {
  logger.info('Stopping daemon')

  ipc.send('node-status', 'stopping')
  if (poll) {
    delete statsCache.peers
    ipc.send('stats', statsCache)
    clearInterval(poll)
    poll = null
  }

  node.stopDaemon(err => {
    if (err) return logger.error(err.stack)

    logger.info('Stopped daemon')

    IPFS = null
    ipc.send('node-status', 'stopped')
    ipc.send('stats', statsCache)
    done()
  })
}

function onCloseWindow () {
  mb.window.hide()
}

function onWillQuit (node, event) {
  logger.info('Shutting down application')

  if (IPFS == null) return

  // Try waiting for the daemon to properly shut down
  // before we actually quit

  event.preventDefault()

  const quit = mb.app.quit.bind(mb.app)
  onStopDaemon(node, quit)
  setTimeout(quit, 1000)
}

function startTray (node) {
  logger.info('Starting tray')

  ipc.on('request-state', onRequestState.bind(null, node))
  ipc.on('start-daemon', onStartDaemon.bind(null, node))
  ipc.on('stop-daemon', onStopDaemon.bind(null, node))
  ipc.on('drop-files', dragDrop)
  ipc.on('close-tray-window', onCloseWindow)

  mb.app.once('will-quit', onWillQuit.bind(null, node))
}

// Initalize a new IPFS node
function initialize (path, node) {
  logger.info('Initialzing new node')

  const welcomeWindow = new BrowserWindow(config.window)

  welcomeWindow.loadUrl(config.urls.welcome)
  welcomeWindow.webContents.on('did-finish-load', () => {
    ipc.send('setup-config-path', path)
  })

  // Close the application if the welcome dialog is canceled
  welcomeWindow.once('close', () => {
    if (!node.initialized) mb.app.quit()
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
  ipc.on('initialize', ({keySize}) => {
    logger.info('Initializing new node with key size: %s in %s.', keySize, userPath)

    ipc.send('initializing')
    node.init({
      directory: userPath,
      keySize
    }, (err, res) => {
      if (err) return ipc.send('initialization-error', err + '')

      fs.writeFileSync(config['ipfs-path-file'], path)

      ipc.send('initialization-complete')
      ipc.send('node-status', 'stopped')

      welcomeWindow.close()
      onStartDaemon(node)
      mb.showWindow()
    })
  })
}

export function getIPFS () {
  return IPFS
}

export {logger}

export function boot (lokker) {
  logger = lokker

  // main entry point
  ipfsd.local((err, node) => {
    if (err) return logger.error(err)

    mb = menubar(config.menuBar)

    mb.on('ready', () => {
      logger.info('Application is ready')

      // Safe ipc calls
      ipc = require('electron-safe-ipc/host')

      // -- load the controls
      require('./controls/open-browser')
      require('./controls/open-console')
      require('./controls/open-settings')

      // tray actions

      mb.tray.on('drop-files', dragDrop)
      mb.tray.setHighlightMode(true)

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

export function reboot () {
  logger.error('Trying to start a second instance')
  dialog.showErrorBox(
    'Multiple instances',
    'Sorry, but there can be only one instance of Station running at the same time.'
  )
}
