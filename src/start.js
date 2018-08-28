import { Menubar } from 'electron-menubar'
import { logo, store, logger } from './utils'
import { ipcMain, app } from 'electron'
import { EventEmitter } from 'events'
import { handleKnownErrors } from './errors'
import registerControls from './controls/main'
import getIpfs from './utils/ipfs'

export default async function (ipfsd) {
  const menubar = new Menubar({
    index: `file://${__dirname}/views/menubar.html`,
    icon: logo('black'),
    tooltip: 'Your IPFS instance',
    preloadWindow: true,
    window: {
      resizable: false,
      fullscreen: false,
      skipTaskbar: true,
      width: 600,
      height: 400,
      backgroundColor: (store.get('lightTheme', false) ? '#FFFFFF' : '#000000'),
      webPreferences: {
        nodeIntegration: true
      }
    }
  })

  let state = 'running'

  const send = (type, ...args) => {
    if (menubar && menubar.window && menubar.window.webContents) {
      menubar.window.webContents.send(type, ...args)
    }
  }

  const isApi = store.get('ipfs.type') === 'api'

  const config = {
    events: new EventEmitter(),
    menubar: menubar,
    send: send,
    isApi: isApi,
    ipfs: () => isApi ? ipfsd : ipfsd.api
  }

  const updateState = (st) => {
    state = st
    onRequestState()
  }

  const onRequestState = () => {
    send('node-status', state)
  }

  const onStopDaemon = (done = () => {}) => {
    logger.info('Stopping daemon')
    updateState('stopping')

    config.events.emit('node:stopped')

    ipfsd.stop((err) => {
      if (err) {
        return logger.error(err.stack)
      }

      logger.info('Stopped daemon')
      menubar.tray.setImage(logo('black'))

      ipfsd = null
      updateState('stopped')
      done()
    })
  }

  const onWillQuit = () => {
    logger.info('Shutting down application')

    if (ipfsd == null) {
      return
    }

    onStopDaemon(() => {
      app.quit()
    })
  }

  const daemonStarted = () => {
    logger.info('Daemon started')
    config.events.emit('node:started')

    if (ipfsd.subprocess) {
      // Stop the executation of the program if some error
      // occurs on the node.
      ipfsd.subprocess.on('error', (e) => {
        updateState('stopped')
        logger.error(e)
      })
    }

    menubar.tray.setImage(logo('ice'))
    updateState('running')
  }

  const onStartDaemon = async () => {
    logger.info('Starting daemon')
    updateState('starting')

    try {
      ipfsd = await getIpfs(store.get('ipfs'))
      daemonStarted()
    } catch (e) {
      handleKnownErrors(e)
    }
  }

  const ready = () => {
    logger.info('Menubar is ready')
    menubar.tray.setHighlightMode('always')

    ipcMain.on('request-state', onRequestState)
    ipcMain.on('quit-application', app.quit.bind(app))
    app.once('will-quit', onWillQuit)
    ipcMain.on('stop-daemon', onStopDaemon.bind(null, () => {}))
    ipcMain.on('start-daemon', onStartDaemon)

    registerControls(config)
    daemonStarted()
  }

  if (menubar.isReady()) ready()
  else menubar.on('ready', ready)
}
