import {Menubar} from 'electron-menubar'
import ipfsd from 'ipfsd-ctl'
import {join} from 'path'
import {dialog, ipcMain, app, BrowserWindow} from 'electron'

import config from './config'
import registerControls from './controls/main'
import handleKnownErrors from './errors'
import StatsPoller from './utils/stats-poller'

const {logger} = config

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

// Ensure it's a single instance.
app.makeSingleInstance(() => {
  logger.error('Trying to start a second instance')
  dialog.showErrorBox(
    'Multiple instances',
    'Sorry, but there can be only one instance of Station running at the same time.'
  )
})

// Make sure Settings Window is closed when quitting the application.
app.on('before-quit', (event) => {
  const {settingsWindow} = config

  if (settingsWindow instanceof BrowserWindow) {
    settingsWindow.destroy()
  }
})

// Local Variables

let poller = null
let IPFS
let menubar

function send (type, ...args) {
  if (menubar && menubar.window && menubar.window.webContents) {
    menubar.window.webContents.send(type, ...args)
  }
}

config.send = send
config.ipfs = () => {
  return IPFS
}

function stopPolling () {
  if (poller) poller.stop()
}

function startPolling () {
  if (poller) poller.start()
}

function onPollerChange (stats) {
  send('stats', stats)
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
    if (err) {
      handleKnownErrors(err)
      return
    }

    logger.info('Started daemon')
    poller = new StatsPoller(ipfsNode, logger)

    if (menubar.window && menubar.window.isVisible()) {
      poller.start()
    }

    poller.on('change', onPollerChange)
    menubar.on('show', startPolling)
    menubar.on('hide', stopPolling)

    menubar.tray.setImage(config.logo.ice)

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

  if (menubar) {
    menubar.removeListener('show', startPolling)
    menubar.removeListener('hide', stopPolling)
  }

  node.stopDaemon((err) => {
    if (err) { return logger.error(err.stack) }

    logger.info('Stopped daemon')
    menubar.tray.setImage(config.logo.black)

    IPFS = null
    send('node-status', 'stopped')
    done()
  })
}

function onWillQuit (node, event) {
  logger.info('Shutting down application')

  if (IPFS == null) {
    return
  }

  event.preventDefault()
  onStopDaemon(node, () => {
    app.quit()
  })
}

// Initalize a new IPFS node
function initialize (path, node) {
  logger.info('Initialzing new node')

  // Initialize the welcome window.
  const window = new BrowserWindow({
    title: 'Welcome to IPFS',
    icon: config.logo.ice,
    show: false,
    resizable: false,
    width: 850,
    height: 450
  })

  // Only show the window when the contents have finished loading.
  window.on('ready-to-show', () => {
    window.show()
    window.focus()
  })

  // Send the default path as soon as the window is ready.
  window.webContents.on('did-finish-load', () => {
    window.webContents.send('setup-config-path', path)
  })

  // Close the application if the welcome dialog is canceled
  window.once('close', () => {
    if (!node.initialized) app.quit()
  })

  window.setMenu(null)
  window.loadURL(`file://${__dirname}/views/welcome.html`)

  let userPath = path

  ipcMain.on('setup-browse-path', () => {
    dialog.showOpenDialog(window, {
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

      window.webContents.send('setup-config-path', userPath)
    })
  })

  // Wait for the user to hit 'Install IPFS'
  ipcMain.on('initialize', (event, { keySize }) => {
    logger.info(`Initializing new node with key size: ${keySize} in ${userPath}.`)
    window.webContents.send('initializing')

    node.init({
      directory: userPath,
      keySize: keySize
    }, (err, res) => {
      if (err) {
        return send('initialization-error', String(err))
      }

      config.settingsStore.set('ipfsPath', path)

      send('initialization-complete')
      send('node-status', 'stopped')

      onStartDaemon(node)
      window.close()
    })
  })
}

// main entry point
ipfsd.local((e, node) => {
  if (e) {
    // We can't start if we fail to aquire
    // a ipfs node
    logger.error(e.stack)
    process.exit(1)
  }

  let appReady = () => {
    logger.info('Application is ready')
    menubar.tray.setHighlightMode(true)

    ipcMain.on('request-state', onRequestState.bind(null, node))
    ipcMain.on('start-daemon', onStartDaemon.bind(null, node))
    ipcMain.on('stop-daemon', onStopDaemon.bind(null, node, () => {}))
    ipcMain.on('quit-application', app.quit.bind(app))
    app.once('will-quit', onWillQuit.bind(null, node))

    registerControls(config)

    if (!node.initialized) {
      initialize(config.settingsStore.get('ipfsPath'), node)
    } else {
      // Start up the daemon
      onStartDaemon(node)
    }
  }

  menubar = new Menubar(config.menubar)
  config.menubar = menubar

  if (menubar.isReady()) appReady()
  else menubar.on('ready', appReady)
})
