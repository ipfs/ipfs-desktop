import { Menubar } from 'electron-menubar'
import { logo, logger, i18n } from '../../utils'
import { Menu, shell, app } from 'electron'

function getContextMenu ({ launchWebUI }) {
  return Menu.buildFromTemplate([
    {
      label: i18n.t('quit'),
      click: () => { app.quit() }
    },
    { type: 'separator' },
    {
      label: i18n.t('settings'),
      click: () => { launchWebUI('/settings') }
    },
    {
      label: i18n.t('logsDirectory'),
      click: () => { shell.openItem(app.getPath('userData')) }
    }
  ])
}

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

    menubar.tray.setContextMenu(getContextMenu(ctx))

    ctx.sendToMenubar = (type, ...args) => {
      if (menubar && menubar.window && menubar.window.webContents) {
        menubar.window.webContents.send(type, ...args)
      }
    }

    const ready = () => {
      logger.info('Menubar is ready')
      resolve()
    }

    if (menubar.isReady()) ready()
    else menubar.on('ready', ready)
  })
}
