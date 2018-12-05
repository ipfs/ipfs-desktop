import { Menubar } from 'electron-menubar'
import { logo, logger, i18n } from '../utils'
import { app, ipcMain } from 'electron'

export default async function (ctx) {
  return new Promise(resolve => {
    const menubar = new Menubar({
      index: `file://${__dirname}/app/index.html`,
      icon: logo('ice'),
      tooltip: i18n.t('ipfsNode'),
      preloadWindow: true,
      window: {
        resizable: false,
        fullscreen: false,
        skipTaskbar: true,
        width: 280,
        height: 385,
        backgroundColor: '#0b3a53',
        webPreferences: {
          nodeIntegration: true
        }
      }
    })

    ctx.menubarWindow = {
      it: menubar,
      send: (type, ...args) => {
        if (menubar && menubar.window && menubar.window.webContents) {
          menubar.window.webContents.send(type, ...args)
        }
      }
    }

    const ready = () => {
      logger.info('Menubar is ready')
      menubar.tray.setHighlightMode('always')
      resolve()
    }

    ipcMain.on('app.quit', async () => {
      app.quit()
    })

    if (menubar.isReady()) ready()
    else menubar.on('ready', ready)
  })
}
