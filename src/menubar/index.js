import { Menubar } from 'electron-menubar'
import { logo, store, logger } from '../utils'
import { EventEmitter } from 'events'

export default async function (ipfsd) {
  const menubar = new Menubar({
    index: `file://${__dirname}/view.html`,
    icon: logo('black'),
    tooltip: 'Your IPFS instance',
    preloadWindow: true,
    window: {
      resizable: false,
      fullscreen: false,
      skipTaskbar: true,
      width: 600,
      height: 400,
      backgroundColor: '#ffffff',
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

  const ready = () => {
    logger.info('Menubar is ready')
    menubar.tray.setHighlightMode('always')
  }

  if (menubar.isReady()) ready()
  else menubar.on('ready', ready)
}
