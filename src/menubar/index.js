import { Menubar } from 'electron-menubar'
import { logo, logger, ConnectionManager } from '../utils'
import registerHooks from '../hooks'

export default async function () {
  return new Promise(resolve => {
    const menubar = new Menubar({
      index: `file://${__dirname}/app/index.html`,
      icon: logo('black'),
      tooltip: 'Your IPFS instance',
      preloadWindow: true,
      window: {
        resizable: false,
        fullscreen: false,
        skipTaskbar: true,
        width: 400,
        height: 500,
        backgroundColor: '#ffffff',
        webPreferences: {
          nodeIntegration: true
        }
      }
    })

    const send = (type, ...args) => {
      if (menubar && menubar.window && menubar.window.webContents) {
        menubar.window.webContents.send(type, ...args)
      }
    }

    registerHooks({
      send: send,
      connManager: new ConnectionManager()
    })

    // TODO:
    menubar.window.setAlwaysOnTop(true)

    const ready = () => {
      logger.info('Menubar is ready')
      menubar.tray.setHighlightMode('always')
      resolve()
    }

    if (menubar.isReady()) ready()
    else menubar.on('ready', ready)
  })
}
