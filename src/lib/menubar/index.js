import { Menubar } from 'electron-menubar'
import { logo, logger, i18n } from '../../utils'
import { Menu, shell, app } from 'electron'

function getContextMenu ({ launchWebUI }) {
  return Menu.buildFromTemplate([
    {
      label: i18n.t('settings'),
      click: () => { launchWebUI('/settings') }
    },
    {
      label: i18n.t('logsDirectory'),
      click: () => { shell.openItem(app.getPath('userData')) }
    },
    { type: 'separator' },
    {
      label: i18n.t('quit'),
      click: () => { app.quit() }
    }
  ])
}

export default async function (ctx) {
  return new Promise(resolve => {
    const menubar = new Menubar({
      index: `file://${__dirname}/app/index.html`,
      icon: logo('black'),
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

    // Cross-Platform Context Menu Extravaganza:
    // - macOS needs to use explicit 'right-click' event
    //   otherwise context menu will show for left click as well
    // - Linux, Windows and the rest seems to be fine with just
    //   setting context menu
    // More: https://electronjs.org/docs/api/tray
    const os = process.platform
    const menu = getContextMenu(ctx)
    if (os === 'darwin') {
      menubar.tray.on('right-click', event => {
        event.preventDefault()
        menubar.tray.popUpContextMenu(menu)
      })
    } else {
      menubar.tray.setContextMenu(menu)
    }

    ctx.sendToMenubar = (type, ...args) => {
      if (type === 'ipfs.started') {
        menubar.tray.setImage(logo('ice'))
      } else if (type === 'ipfs.stopped') {
        menubar.tray.setImage(logo('black'))
      }

      if (menubar && menubar.window && menubar.window.webContents) {
        menubar.window.webContents.send(type, ...args)
      }
    }

    const ready = () => {
      logger.info('[menubar] ready')
      resolve()
    }

    if (menubar.isReady()) ready()
    else menubar.on('ready', ready)
  })
}
