import { Menubar } from 'electron-menubar'
import { logo, logger } from '../utils'
import registerHooks from '../hooks'

export default async function (ipfsd) {
  return new Promise(resolve => {
    const menubar = new Menubar({
      index: `file://${__dirname}/view/index.html`,
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

    const send = (type, ...args) => {
      if (menubar && menubar.window && menubar.window.webContents) {
        menubar.window.webContents.send(type, ...args)
      }
    }

    registerHooks({
      send: send,
      getIpfs: () => null
    })

    const ready = () => {
      logger.info('Menubar is ready')
      menubar.tray.setHighlightMode('always')
      resolve()
    }

    if (menubar.isReady()) ready()
    else menubar.on('ready', ready)
  })
}
