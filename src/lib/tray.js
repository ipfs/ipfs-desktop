import { logo, store, logger, i18n } from '../utils'
import { Menu, Tray, shell, app, ipcMain } from 'electron'
import path from 'path'

function buildMenu ({ checkForUpdates, launchWebUI }) {
  return Menu.buildFromTemplate([
    ...[
      ['ipfsIsStarting', 'yellow'],
      ['ipfsIsRunning', 'green'],
      ['ipfsIsStopping', 'yellow'],
      ['ipfsIsNotRunning', 'gray'],
      ['ipfsHasErrored', 'red']
    ].map(([status, color]) => ({
      id: status,
      label: i18n.t(status),
      visible: false,
      enabled: false,
      icon: path.resolve(path.join(__dirname, `../icons/status/${color}.png`))
    })),
    {
      id: 'startIpfs',
      label: i18n.t('startIpfs'),
      click: () => { ipcMain.emit('startIpfs') },
      visible: false
    },
    {
      id: 'stopIpfs',
      label: i18n.t('stopIpfs'),
      click: () => { ipcMain.emit('stopIpfs') },
      visible: false
    },

    { type: 'separator' },
    {
      label: i18n.t('status'),
      click: () => { launchWebUI('/status') }
    },
    {
      label: i18n.t('files'),
      click: () => { launchWebUI('/files') }
    },
    {
      label: i18n.t('explore'),
      click: () => { launchWebUI('/explore') }
    },
    {
      label: i18n.t('peers'),
      click: () => { launchWebUI('/peers') }
    },
    { type: 'separator' },
    {
      label: i18n.t('checkForUpdates'),
      click: () => { checkForUpdates() }
    },
    {
      label: i18n.t('advanced'),
      submenu: [
        {
          label: i18n.t('settings'),
          click: () => { launchWebUI('/settings') }
        },
        {
          label: i18n.t('logsDirectory'),
          click: () => { shell.openItem(app.getPath('userData')) }
        },
        {
          label: i18n.t('repositoryDirectory'),
          click: () => { shell.openItem(store.get('ipfsConfig.path')) }
        },
        {
          label: i18n.t('configFile'),
          click: () => { shell.openItem(store.path) }
        }
      ]
    },
    { type: 'separator' },
    {
      label: i18n.t('about')
    },
    {
      label: i18n.t('quit'),
      click: () => { app.quit() }
    }
  ])
}

export default function (ctx) {
  logger.info('[tray] starting')
  const tray = new Tray(logo('black'))
  let menu = null
  let status = {}

  const setupMenu = () => {
    menu = buildMenu(ctx)
    tray.setContextMenu(menu)
    tray.setToolTip(i18n.t('ipfsDesktop'))
    updateStatus(status)
  }

  const updateStatus = data => {
    status = data

    menu.getMenuItemById('ipfsIsStarting').visible = status.starting && !status.done
    menu.getMenuItemById('ipfsIsRunning').visible = status.starting && status.done
    menu.getMenuItemById('stopIpfs').visible = status.starting && status.done
    menu.getMenuItemById('ipfsIsStopping').visible = status.stopping && !status.done
    menu.getMenuItemById('ipfsIsNotRunning').visible = status.stopping && status.done
    menu.getMenuItemById('startIpfs').visible = (status.stopping && status.done) || status.failed
    menu.getMenuItemById('ipfsHasErrored').visible = status.failed

    if (status.starting && status.done) {
      tray.setImage(logo('ice'))
    } else {
      tray.setImage(logo('black'))
    }
  }

  ipcMain.on('ipfsd', (status) => { updateStatus(status) })
  ipcMain.on('languageUpdated', () => { setupMenu(status) })
  setupMenu()

  ctx.tray = tray
  logger.info('[tray] started')
}
