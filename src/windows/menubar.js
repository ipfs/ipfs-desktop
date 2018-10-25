import { Menubar } from 'electron-menubar'
import { logo, logger } from '../utils'
import { app, ipcMain } from 'electron'

export default async function (opts) {
  return new Promise(resolve => {
    const menubar = new Menubar({
      index: `file://${__dirname}/menubar/index.html`,
      icon: logo('black'),
      tooltip: 'Your IPFS instance',
      preloadWindow: true,
      window: {
        resizable: false,
        fullscreen: false,
        skipTaskbar: true,
        width: 280,
        height: 385,
        backgroundColor: '#ffffff',
        webPreferences: {
          nodeIntegration: true
        }
      }
    })

    opts.menubarWindow = {
      it: menubar,
      send: (type, ...args) => {
        if (menubar && menubar.window && menubar.window.webContents) {
          menubar.window.webContents.send(type, ...args)
        }
      }
    }

    if (process.env.NODE_ENV === 'development') {
      menubar.window.setAlwaysOnTop(true)
    }

    const ready = () => {
      logger.info('Menubar is ready')
      menubar.tray.setHighlightMode('always')
      resolve()
    }

    ipcMain.on('app.quit', async () => {
      logger.info('Disconnecting all IPFS instances')
      await opts.connManager.disconnectAll()
      logger.info('Done. Quitting app')
      app.quit()
    })

    if (menubar.isReady()) ready()
    else menubar.on('ready', ready)
  })
}
