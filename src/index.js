import {Menubar} from 'electron-menubar'
import fs from 'fs'
import DaemonFactory from 'ipfsd-ctl'
import {join} from 'path'
import {dialog, ipcMain, app, BrowserWindow} from 'electron'

import init from './init'

import config from './config'
import registerControls from './controls/main'
import handleKnownErrors from './errors'

const {debug} = config

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

// Ensure it's a single instance.
app.makeSingleInstance(() => {
  debug('Trying to start a second instance')
  dialog.showErrorBox(
    'Multiple instances',
    'Sorry, but there can be only one instance of IPFS Desktop running at the same time.'
  )
})

// Local Variables

let IPFS
let menubar
let state = 'stopped'

function send (type, ...args) {
  if (menubar && menubar.window && menubar.window.webContents) {
    menubar.window.webContents.send(type, ...args)
  }
}

config.send = send
config.ipfs = () => IPFS

function updateState (st) {
  state = st
  onRequestState()
}

function onRequestState (node, event) {
  send('node-status', state)
}

function onStartDaemon (node) {
  debug('Starting daemon')
  updateState('starting')

  // Tries to remove the repo.lock file if it already exists.
  // This fixes a bug on Windows, where the daemon seems
  // not to be exiting correctly, hence the file is not
  // removed.
  const lockPath = join(config.settingsStore.get('ipfsPath'), 'repo.lock')
  const apiPath = join(config.settingsStore.get('ipfsPath'), 'api')

  if (fs.existsSync(lockPath)) {
    try {
      fs.unlinkSync(lockPath)
    } catch (e) {
      debug('Could not remove lock. Daemon might be running.')
    }
  }

  if (fs.existsSync(apiPath)) {
    try {
      fs.unlinkSync(apiPath)
    } catch (e) {
      debug('Could not remove API file. Daemon might be running.')
    }
  }

  const flags = []
  if (config.settingsStore.get('dhtClient')) {
    flags.push('--routing=dhtclient')
  }

  node.start(flags, (err, api) => {
    if (err) {
      handleKnownErrors(err)
      return
    }

    IPFS = api
    debug('Daemon started')
    config.events.emit('node:started')

    if (node.subprocess) {
      // Stop the executation of the program if some error
      // occurs on the node.
      node.subprocess.on('error', (e) => {
        updateState('stopped')
        debug(e)
      })
    }

    menubar.tray.setImage(config.logo.ice)
    updateState('running')
  })
}

function onStopDaemon (node, done) {
  debug('Stopping daemon')
  updateState('stopping')

  config.events.emit('node:stopped')

  node.stop((err) => {
    if (err) {
      return debug(err.stack)
    }

    debug('Stopped daemon')
    menubar.tray.setImage(config.logo.black)

    IPFS = null
    updateState('stopped')
    done()
  })
}

function onWillQuit (node, event) {
  debug('Shutting down application')

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
  debug('Initialzing new node')

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
    debug(`Initializing new node with key size: ${keySize} in ${userPath}.`)
    window.webContents.send('initializing')

    node.init({
      directory: userPath,
      keySize: keySize
    }, (err, res) => {
      if (err) {
        return send('initialization-error', String(err))
      }

      config.settingsStore.set('ipfsPath', userPath)

      send('initialization-complete')
      updateState('stopped')

      onStartDaemon(node)
      window.close()
    })
  })
}

/* 
// main entry point
DaemonFactory.create().spawn({
  repoPath: config.settingsStore.get('ipfsPath'),
  disposable: false,
  init: false,
  start: false,
  defaultAddrs: true
}, (err, node) => {
  if (err) {
    // We can't start if we fail to aquire
    // a ipfs node
    debug(err.stack)
    process.exit(1)
  }

  let appReady = () => {
    debug('Application is ready')
    menubar.tray.setHighlightMode('always')

    ipcMain.on('request-state', onRequestState.bind(null, node))
    ipcMain.on('start-daemon', onStartDaemon.bind(null, node))
    ipcMain.on('stop-daemon', onStopDaemon.bind(null, node, () => {}))
    ipcMain.on('quit-application', app.quit.bind(app))
    app.once('will-quit', onWillQuit.bind(null, node))

    registerControls(config)

    let exists = fs.existsSync(node.repoPath)

    if (!exists) {
      initialize(config.settingsStore.get('ipfsPath'), node)
    } else {
      onStartDaemon(node)
    }
  }

  menubar = new Menubar(config.menubar)
  config.menubar = menubar

  if (menubar.isReady()) appReady()
  else menubar.on('ready', appReady)
}) */

menubar = new Menubar(config.menubar)
config.menubar = menubar

if (menubar.isReady()) init()
else menubar.on('ready', init)
