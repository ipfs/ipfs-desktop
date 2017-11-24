import menubar from 'menubar'
import fs from 'fs'
import ipfsd from 'ipfsd-ctl'
import {join} from 'path'
import {lookupPretty} from 'ipfs-geoip'

import config from './config'
import dragDrop from './controls/drag-drop'

import {dialog, BrowserWindow, ipcMain} from 'electron'

if (config.isProduction) {
  require('electron').crashReporter.start()
} else {
  require('electron-debug')()
}

// Local Variables

let IPFS
let mb
let logger
let shouldPoll = false
const statsCache = {}

function pollStats (ipfs) {
  const next = () => {
    setTimeout(() => {
      pollStats(ipfs)
    }, 1000)
  }

  if (!shouldPoll || !mb.window || !mb.window.isVisible()) {
    return next()
  }

  ipfs.swarm.peers()
    .then((res) => {
      statsCache.peers = res.length
      mb.window.webContents.send('stats', statsCache)
    }, (err) => {
      logger.error(err.stack)
    })
    .then(next)

  // TODO: solve?
  ipfs.id()
    .then((peer) => {
      lookupPretty(ipfs, peer.addresses, (err, location) => {
        if (err) {
          logger.error(err)
          statsCache.location = 'Unknown'
          mb.window.webContents.send('stats', statsCache)
          return
        }

        statsCache.location = location && location.formatted
        mb.window.webContents.send('stats', statsCache)
      })
    })
    .catch(logger.error)
}

function onRequestState (node, event) {
  if (node.initialized) {
    let status = 'stopped'

    if (node.daemonPid()) {
      status = IPFS ? 'running' : 'starting'
    }

    mb.window.webContents.send('node-status', status)
  }
}

function onStartDaemon (node) {
  console.log('start daemon')
  mb.window.webContents.send('node-status', 'starting')
  node.startDaemon(function (err, ipfsNode) {
    if (err) throw err

    mb.window.webContents.send('node-status', 'running')

    shouldPoll = true
    pollStats(ipfsNode)

    ipfsNode.version()
      .then((res) => {
        mb.window.webContents.send('version', res)
      })
      .catch((err) => {
        logger.error(err)
      })

    IPFS = ipfsNode
  })
}

function onStopDaemon (node, done) {
  logger.info('Stopping daemon')

  const send = (type, msg) => {
    if (mb && mb.window && mb.window.webContents) {
      mb.window.webContents.send(type, msg)
    }
  }

  send('node-status', 'stopping')
  if (shouldPoll) {
    delete statsCache.peers
    send('stats', statsCache)
    shouldPoll = false
  }

  node.stopDaemon((err) => {
    if (err) return logger.error(err.stack)

    logger.info('Stopped daemon')

    IPFS = null
    send('node-status', 'stopped')
    send('stats', statsCache)
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

  ipcMain.on('request-state', onRequestState.bind(null, node))
  ipcMain.on('start-daemon', onStartDaemon.bind(null, node))
  ipcMain.on('stop-daemon', onStopDaemon.bind(null, node, () => {}))
  ipcMain.on('drop-files', dragDrop.bind(null))
  ipcMain.on('close-tray-window', onCloseWindow)

  mb.app.once('will-quit', onWillQuit.bind(null, node))
}

// Initalize a new IPFS node
function initialize (path, node) {
  logger.info('Initialzing new node')

  const welcomeWindow = new BrowserWindow(config.window)

  welcomeWindow.loadURL(config.urls.welcome)
  welcomeWindow.webContents.on('did-finish-load', () => {
    welcomeWindow.webContents.send('setup-config-path', path)
  })

  // Close the application if the welcome dialog is canceled
  welcomeWindow.once('close', () => {
    if (!node.initialized) mb.app.quit()
  })

  let userPath = path

  ipcMain.on('setup-browse-path', () => {
    dialog.showOpenDialog(welcomeWindow, {
      title: 'Select a directory',
      defaultPath: path,
      properties: [
        'openDirectory',
        'createDirectory'
      ]
    }, (res) => {
      if (!res) return

      userPath = res[0]

      if (!userPath.match(/.ipfs\/?$/)) {
        userPath = join(userPath, '.ipfs')
      }

      welcomeWindow.webContents.send('setup-config-path', userPath)
    })
  })

  // wait for msg from frontend
  ipcMain.on('initialize', ({keySize}) => {
    logger.info('Initializing new node with key size: %s in %s.', keySize, userPath)

    welcomeWindow.webContents.send('initializing')
    node.init({
      directory: userPath,
      keySize
    }, (err, res) => {
      if (err) {
        return welcomeWindow.webContents.send('initialization-error', String(err))
      }

      fs.writeFileSync(config['ipfs-path-file'], path)

      welcomeWindow.webContents.send('initialization-complete')
      welcomeWindow.webContents.send('node-status', 'stopped')

      welcomeWindow.close()
      onStartDaemon(node)
      mb.showWindow()
    })
  })
}

function reboot () {
  logger.error('Trying to start a second instance')
  dialog.showErrorBox(
    'Multiple instances',
    'Sorry, but there can be only one instance of Station running at the same time.'
  )
}

export function getIPFS () {
  return IPFS
}

export {logger}

export function boot (lokker) {
  logger = lokker

  // main entry point
  ipfsd.local((err, node) => {
    if (err) {
      // We can't start if we fail to aquire
      // a ipfs node
      logger.error(err)
      process.exit(1)
    }

    mb = menubar(config.menuBar)

    // Ensure single instance
    mb.app.makeSingleInstance(reboot)

    mb.on('ready', () => {
      logger.info('Application is ready')

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
