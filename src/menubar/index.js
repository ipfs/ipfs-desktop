import { Menubar } from 'electron-menubar'
import { logo, store, logger, ConnectionManager, Connection } from '../utils'
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

    const connManager = new ConnectionManager()
    const conns = store.get('configs')

    for (const id of Object.keys(conns)) {
      const conn = new Connection(conns[id], id)
      connManager.addConnection(conn)
    }

    registerHooks({ send, connManager })

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
