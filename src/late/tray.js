import { store, logger } from '../utils'
import { Menu, Tray, shell, app, ipcMain } from 'electron'
import i18n from 'i18next'
import { STATUS } from './register-daemon'
import path from 'path'
import os from 'os'

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
      icon: path.resolve(path.join(__dirname, `../../assets/icons/status/${color}.png`))
    })),
    {
      id: 'restartIpfs',
      label: i18n.t('restart'),
      click: () => { ipcMain.emit('restartIpfs') },
      visible: false
    },
    {
      id: 'startIpfs',
      label: i18n.t('start'),
      click: () => { ipcMain.emit('startIpfs') },
      visible: false
    },
    {
      id: 'stopIpfs',
      label: i18n.t('stop'),
      click: () => { ipcMain.emit('stopIpfs') },
      visible: false
    },
    { type: 'separator' },
    {
      label: i18n.t('status'),
      click: () => { launchWebUI('/') }
    },
    {
      label: i18n.t('files'),
      click: () => { launchWebUI('/files') }
    },
    {
      label: i18n.t('settings'),
      click: () => { launchWebUI('/settings') }
    },
    { type: 'separator' },
    {
      label: i18n.t('advanced'),
      submenu: [
        {
          label: i18n.t('openLogsDir'),
          click: () => { shell.openItem(app.getPath('userData')) }
        },
        {
          label: i18n.t('openRepoDir'),
          click: () => { shell.openItem(store.get('ipfsConfig.path')) }
        },
        {
          label: i18n.t('openConfigFile'),
          click: () => { shell.openItem(store.path) }
        }
      ]
    },
    {
      label: i18n.t('about'),
      submenu: [
        {
          label: i18n.t('versions'),
          enabled: false
        },
        {
          label: `ipfs-desktop ${require('../../package.json').version}`,
          click: () => { shell.openExternal('https://github.com/ipfs-shipyard/ipfs-desktop/releases') }
        },
        {
          label: `go-ipfs ${require('../../package.json').dependencies['go-ipfs-dep']}`,
          click: () => { shell.openExternal('https://github.com/ipfs/go-ipfs/releases') }
        },
        { type: 'separator' },
        {
          label: i18n.t('checkForUpdates'),
          click: () => { checkForUpdates() }
        },
        {
          label: i18n.t('viewOnGitHub'),
          click: () => { shell.openExternal('https://github.com/ipfs-shipyard/ipfs-desktop/blob/master/README.md') }
        }
      ]
    },
    {
      label: i18n.t('quit'),
      click: () => { app.quit() }
    }
  ])
}

function icon (color) {
  const p = path.resolve(path.join(__dirname, '../../assets/icons/tray'))

  if (os.platform() === 'darwin') {
    return path.join(p, `${color}.png`)
  }

  return path.join(p, `${color}-big.png`)
}

export default function (ctx) {
  logger.info('[tray] starting')
  const tray = new Tray(icon('black'))
  let menu = null
  let status = {}

  if (os.platform() !== 'darwin') {
    // Show the context menu on left click on other
    // platforms than macOS.
    tray.on('click', event => {
      event.preventDefault()
      tray.popUpContextMenu()
    })
  }

  const setupMenu = () => {
    menu = buildMenu(ctx)
    tray.setContextMenu(menu)
    tray.setToolTip('IPFS Desktop')
    updateStatus(status)
  }

  const updateStatus = data => {
    status = data

    menu.getMenuItemById('ipfsIsStarting').visible = status === STATUS.STARTING_STARTED
    menu.getMenuItemById('ipfsIsRunning').visible = status === STATUS.STARTING_FINISHED
    menu.getMenuItemById('ipfsIsStopping').visible = status === STATUS.STOPPING_STARTED
    menu.getMenuItemById('ipfsIsNotRunning').visible = status === STATUS.STOPPING_FINISHED
    menu.getMenuItemById('ipfsHasErrored').visible = status === STATUS.STARTING_FAILED ||
      status === STATUS.STOPPING_FAILED
    menu.getMenuItemById('restartIpfs').visible = status === STATUS.STARTING_FINISHED ||
      menu.getMenuItemById('ipfsHasErrored').visible
    menu.getMenuItemById('startIpfs').visible = menu.getMenuItemById('ipfsIsNotRunning').visible
    menu.getMenuItemById('stopIpfs').visible = menu.getMenuItemById('ipfsIsRunning').visible

    if (status === STATUS.STARTING_FINISHED) {
      tray.setImage(icon('ice'))
    } else {
      tray.setImage(icon('black'))
    }

    if (os.platform() === 'linux') {
      // On Linux, in order for changes made to individual MenuItems to take effect,
      // you have to call setContextMenu again - https://electronjs.org/docs/api/tray
      tray.setContextMenu(menu)
    }
  }

  ipcMain.on('ipfsd', (status) => { updateStatus(status) })
  ipcMain.on('languageUpdated', () => { setupMenu(status) })
  setupMenu()

  ctx.tray = tray
  logger.info('[tray] started')
}
