import { Menubar } from 'electron-menubar'
import { logo, store, logger, ConnectionManager, Connection } from '../utils'
import registerHooks from '../hooks'

async function initialSetup ({ send, connManager }) {
  const configs = store.get('configs')
  const defaultConfig = store.get('defaultConfig')

  for (const id of Object.keys(configs)) {
    const conn = new Connection(configs[id], id)

    if (!conn.justApi) {
      await conn.init()
    }

    connManager.addConnection(conn)
  }

  if (defaultConfig) {
    connManager.connect(defaultConfig)
  }
}

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

    connManager.on('started', (id) => {
      send('ipfs.started', id)
      menubar.tray.setImage(logo('ice'))
    })

    connManager.on('stopped', () => {
      send('ipfs.stopped')
      menubar.tray.setImage(logo('black'))
    })

    registerHooks({ send, connManager })
    initialSetup({ send, connManager })

    // TODO: only in DEV
    menubar.window.setAlwaysOnTop(true)

    const ready = () => {
      logger.info('Menubar is ready')
      menubar.tray.setHighlightMode('always')

      if (connManager.running) {
        send('ipfs.started', connManager.currentId)
      }

      resolve()
    }

    if (menubar.isReady()) ready()
    else menubar.on('ready', ready)
  })
}
