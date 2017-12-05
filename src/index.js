import menubar from 'menubar'
import fs from 'fs'
import ipfsd from 'ipfsd-ctl'

import uploadFiles from './controls/upload-files'
import openWebUI from './controls/open-webui'
import openFileDialog from './controls/open-file-dialog'

import {join} from 'path'
import config, {logger, fileHistory, logoIpfsIce, logoIpfsBlack} from './config'
import {dialog, ipcMain, shell, app} from 'electron'

import StatsPoller from './utils/stats-poller'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

process.on('uncaughtException', (error) => {
  const msg = error.message || error
  logger.error(`Uncaught Exception: ${msg}`, error)
  dialog.showErrorBox('Uncaught Exception:', msg)
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

let poller = null
let IPFS
let mb

function send (type, arg) {
  if (mb && mb.window && mb.window.webContents) {
    mb.window.webContents.send(type, arg)
  }
}

function stopPolling () {
  if (poller) poller.stop()
}

function startPolling () {
  if (poller) poller.start()
}

function openSettings () {
  shell.openExternal(join(config.ipfsPath, 'config'))
}

function onPollerChange (stats) {
  send('stats', stats)
}

function onFileHistoryChange () {
  send('files', fileHistory.toArray())
}

function onCloseWindow () {
  mb.window.hide()
}

function onRequestState (node, event) {
  if (node.initialized) {
    let status = 'stopped'

    if (node.daemonPid()) {
      status = IPFS ? 'running' : 'starting'
    }

    send('node-status', status)
  }
}

function onStartDaemon (node) {
  logger.info('Start daemon')
  send('node-status', 'starting')

  node.startDaemon((err, ipfsNode) => {
    if (err) throw err

    poller = new StatsPoller(ipfsNode, logger)

    if (mb.window && mb.window.isVisible()) {
      poller.start()
    }

    poller.on('change', onPollerChange)
    mb.on('show', startPolling)
    mb.on('hide', stopPolling)

    mb.tray.setImage(logoIpfsIce)

    send('node-status', 'running')
    IPFS = ipfsNode
  })
}

function onStopDaemon (node, done) {
  logger.info('Stopping daemon')
  send('node-status', 'stopping')

  if (poller) {
    poller.stop()
    poller = null
  }

  if (mb) {
    mb.removeListener('show', startPolling)
    mb.removeListener('hide', stopPolling)
  }

  node.stopDaemon((err) => {
    if (err) { return logger.error(err.stack) }

    logger.info('Stopped daemon')
    mb.tray.setImage(logoIpfsBlack)

    IPFS = null
    send('node-status', 'stopped')
    done()
  })
}

function onWillQuit (node, event) {
  logger.info('Shutting down application')

  if (IPFS == null) return

  // TODO: Try waiting for the daemon to properly
  // shut down before we actually quit

  event.preventDefault()

  const quit = mb.app.quit.bind(mb.app)
  onStopDaemon(node, quit)
  setTimeout(quit, 1000)
}

function startTray (node) {
  logger.info('Starting tray')

  // Update File History on change and when it is requested.
  ipcMain.on('request-files', onFileHistoryChange)
  fileHistory.on('change', onFileHistoryChange)

  ipcMain.on('request-state', onRequestState.bind(null, node))
  ipcMain.on('start-daemon', onStartDaemon.bind(null, node))
  ipcMain.on('stop-daemon', onStopDaemon.bind(null, node, () => {}))
  ipcMain.on('drop-files', uploadFiles.bind(null, getIPFS))
  ipcMain.on('close-tray-window', onCloseWindow)

  ipcMain.on('open-webui', openWebUI.bind(null, getIPFS))
  ipcMain.on('open-settings', openSettings)

  mb.app.once('will-quit', onWillQuit.bind(null, node))

  ipcMain.on('open-file-dialog', openFileDialog(mb.window, getIPFS))
  ipcMain.on('open-dir-dialog', openFileDialog(mb.window, getIPFS, true))
}

// Initalize a new IPFS node
function initialize (path, node) {
  logger.info('Initialzing new node')

  mb.window.loadURL(config.urls.welcome)
  mb.window.webContents.on('did-finish-load', () => {
    send('setup-config-path', path)
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

      send('setup-config-path', userPath)
    })
  })

  // wait for msg from frontend
  ipcMain.on('initialize', (event, { keySize }) => {
    logger.info(`Initializing new node with key size: ${keySize} in ${userPath}.`)

    send('initializing')
    node.init({
      directory: userPath,
      keySize: keySize
    }, (err, res) => {
      if (err) {
        return send('initialization-error', String(err))
      }

      fs.writeFileSync(config.ipfsPathFile, path)

      send('initialization-complete')
      send('node-status', 'stopped')

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

    mb.tray.on('drop-files', uploadFiles.bind(null, getIPFS))
    mb.tray.setHighlightMode(true)

    startTray(node)

    if (!node.initialized) {
      initialize(config.ipfsPath, node)
    } else {
      // Start up the daemon
      onStartDaemon(node)
    }
  })
})
