import menubar from 'menubar'
import fs from 'fs'
import ipfsd from 'ipfsd-ctl'

import openBrowser from './controls/open-browser'
import dragDrop from './controls/drag-drop'

import {join} from 'path'
import {lookupPretty} from 'ipfs-geoip'
import config, {logger} from './config'
import {dialog, ipcMain, Menu, shell, app} from 'electron'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

process.on('uncaughtException', (error) => {
  const msg = error.message || error
  logger.error(`Uncaught Exception: ${msg}`, error)
  process.exit(1)
})

if (config.isProduction) {
  require('electron').crashReporter.start({
    productName: 'Station',
    companyName: 'IPFS',
    submitURL: 'https://ipfs.io',
    uploadToServer: false
  })
} else {
  require('electron-debug')()
}

// Local Variables

let IPFS
let mb
let shouldPoll = false
const statsCache = {}
const locationsCache = {}

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
      res = res.sort((a, b) => {
        return a.peer.toB58String() > b.peer.toB58String() ? 1 : -1
      })

      let peers = []

      res.forEach(rawPeer => {
        let peer = {
          id: rawPeer.peer.toB58String(),
          addr: rawPeer.addr.toString(),
          location: {
            formatted: 'Unknown'
          }
        }

        if (!locationsCache[peer.id]) {
          lookupPretty(IPFS, [peer.addr], (err, result) => {
            if (err) return
            locationsCache[peer.id] = result
          })
        } else {
          peer.location = locationsCache[peer.id]
        }

        peers.push(peer)
      })

      statsCache.peers = peers
      mb.window.webContents.send('stats', statsCache)
    }, (err) => {
      logger.error(err.stack)
    })
    .then(next)

  ipfs.id()
    .then((peer) => {
      statsCache.node = peer
      statsCache.node.location = 'Unknown'

      lookupPretty(IPFS, peer.addresses, (err, location) => {
        if (err) {
          mb.window.webContents.send('stats', statsCache)
          return
        }

        statsCache.node.location = location && location.formatted
        mb.window.webContents.send('stats', statsCache)
      })
    })
    .catch(logger.error)

  ipfs.repo.stat()
    .then(repo => {
      statsCache.repo = repo
      mb.window.webContents.send('stats', statsCache)
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

let fileHistory = (() => {
  let history = []

  if (fs.existsSync(config.ipfsFileHistoryFile)) {
    history = JSON.parse(fs.readFileSync(config.ipfsFileHistoryFile))
  } else {
    history = []
    fs.writeFileSync(config.ipfsFileHistoryFile, JSON.stringify(history))
  }

  return history
})()

export function appendFile (name, hash) {
  fileHistory.unshift({
    name,
    hash,
    date: new Date()
  })

  fs.writeFileSync(config.ipfsFileHistoryFile, JSON.stringify(fileHistory))
  onRequestFiles()
}

function onRequestFiles () {
  mb.window.webContents.send('files', fileHistory)
}

function onStartDaemon (node) {
  logger.info('Start daemon')
  mb.window.webContents.send('node-status', 'starting')
  node.startDaemon(function (err, ipfsNode) {
    if (err) throw err

    shouldPoll = true
    pollStats(ipfsNode)

    mb.window.webContents.send('node-status', 'running')
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
  ipcMain.on('request-files', onRequestFiles)
  ipcMain.on('start-daemon', onStartDaemon.bind(null, node))
  ipcMain.on('stop-daemon', onStopDaemon.bind(null, node, () => {}))
  ipcMain.on('drop-files', dragDrop.bind(null))
  ipcMain.on('close-tray-window', onCloseWindow)
  ipcMain.on('open-webui', openBrowser)

  ipcMain.on('open-settings', () => {
    shell.openExternal(join(config.ipfsPath, 'config'))
  })

  ipcMain.on('small-window', () => {
    mb.window.setSize(350, config.menubar.height)
  })

  ipcMain.on('medium-window', () => {
    mb.window.setSize(600, config.menubar.height)
  })

  ipcMain.on('big-window', () => {
    mb.window.setSize(800, config.menubar.height)
  })

  mb.app.once('will-quit', onWillQuit.bind(null, node))
}

// Initalize a new IPFS node
function initialize (path, node) {
  logger.info('Initialzing new node')

  mb.window.loadURL(config.urls.welcome)
  mb.window.webContents.on('did-finish-load', () => {
    mb.window.webContents.send('setup-config-path', path)
  })
  mb.showWindow()

  // Close the application if the welcome dialog is canceled
  mb.window.once('close', () => {
    if (!node.initialized) mb.app.quit()
  })

  let userPath = path

  ipcMain.on('setup-browse-path', () => {
    dialog.showOpenDialog(mb.window, {
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

      mb.window.webContents.send('setup-config-path', userPath)
    })
  })

  // wait for msg from frontend
  ipcMain.on('initialize', (event, { keySize }) => {
    logger.info(`Initializing new node with key size: ${keySize} in ${userPath}.`)

    mb.window.webContents.send('initializing')
    node.init({
      directory: userPath,
      keySize
    }, (err, res) => {
      if (err) {
        return mb.window.webContents.send('initialization-error', String(err))
      }

      fs.writeFileSync(config.ipfsPathFile, path)

      mb.window.webContents.send('initialization-complete')
      mb.window.webContents.send('node-status', 'stopped')

      onStartDaemon(node)
      mb.window.loadURL(config.menubar.index)
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

// main entry point
ipfsd.local((err, node) => {
  if (err) {
    // We can't start if we fail to aquire
    // a ipfs node
    logger.error(err)
    process.exit(1)
  }

  mb = menubar(config.menubar)

  // Ensure single instance.
  mb.app.makeSingleInstance(reboot)

  mb.on('ready', () => {
    logger.info('Application is ready')

    mb.tray.on('drop-files', dragDrop)
    mb.tray.setHighlightMode(true)

    startTray(node)

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Settings',
        click: () => shell.openExternal(join(config.ipfsPath, 'config'))
      },
      {
        label: 'Exit',
        click: () => mb.app.quit()
      }
    ])

    mb.tray.setContextMenu(contextMenu)

    if (!node.initialized) {
      initialize(config.ipfsPath, node)
    } else {
      // Start up the daemon
      onStartDaemon(node)
    }
  })
})
