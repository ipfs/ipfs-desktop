const { Menu, Tray, shell, app, ipcMain } = require('electron')
const i18n = require('i18next')
const path = require('path')
const addToIpfs = require('./add-to-ipfs')
const { STATUS } = require('./daemon')
const logger = require('./common/logger')
const store = require('./common/store')
const { IS_MAC, IS_WIN, VERSION, GO_IPFS_VERSION } = require('./common/consts')
const moveRepositoryLocation = require('./move-repository-location')

const { SHORTCUT: SCREENSHOT_SHORTCUT, CONFIG_KEY: SCREENSHOT_KEY, takeScreenshot } = require('./take-screenshot')
const { SHORTCUT: HASH_SHORTCUT, CONFIG_KEY: HASH_KEY, downloadHash } = require('./download-hash')
const { CONFIG_KEY: AUTO_LAUNCH_KEY } = require('./auto-launch')
const { CONFIG_KEY: IPFS_PATH_KEY } = require('./ipfs-on-path')
const { CONFIG_KEY: NPM_IPFS_KEY } = require('./npm-on-ipfs')

const CONFIG_KEYS = [
  AUTO_LAUNCH_KEY,
  IPFS_PATH_KEY,
  NPM_IPFS_KEY,
  SCREENSHOT_KEY,
  HASH_KEY
]

function buildCheckbox (key, label) {
  return {
    id: key,
    label: i18n.t(label),
    click: () => { ipcMain.emit(`toggle_${key}`) },
    type: 'checkbox',
    checked: false
  }
}

// Notes on this: we are only supporting accelerators on macOS for now because
// they natively work as soon as the menu opens. They don't work like that on Windows
// or other OSes and must be registered globally. They still collide with global
// accelerator. Please see ../utils/setup-global-shortcut.js for more info.
function buildMenu (ctx) {
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
      icon: path.resolve(path.join(__dirname, `../assets/icons/status/${color}.png`))
    })),
    {
      id: 'restartIpfs',
      label: i18n.t('restart'),
      click: () => { ctx.restartIpfs() },
      visible: false,
      accelerator: IS_MAC ? 'Command+R' : null
    },
    {
      id: 'startIpfs',
      label: i18n.t('start'),
      click: () => { ctx.startIpfs() },
      visible: false
    },
    {
      id: 'stopIpfs',
      label: i18n.t('stop'),
      click: () => { ctx.stopIpfs() },
      visible: false
    },
    { type: 'separator' },
    {
      label: i18n.t('status'),
      click: () => { ctx.launchWebUI('/') }
    },
    {
      label: i18n.t('files'),
      click: () => { ctx.launchWebUI('/files') }
    },
    { type: 'separator' },
    {
      id: 'takeScreenshot',
      label: i18n.t('takeScreenshot'),
      click: () => { takeScreenshot(ctx) },
      accelerator: IS_MAC ? SCREENSHOT_SHORTCUT : null,
      enabled: false
    },
    {
      id: 'downloadHash',
      label: i18n.t('downloadHash'),
      click: () => { downloadHash(ctx) },
      accelerator: IS_MAC ? HASH_SHORTCUT : null,
      enabled: false
    },
    { type: 'separator' },
    {
      label: IS_MAC ? i18n.t('settings.preferences') : i18n.t('settings.settings'),
      submenu: [
        buildCheckbox(AUTO_LAUNCH_KEY, 'settings.launchOnStartup'),
        buildCheckbox(IPFS_PATH_KEY, 'settings.ipfsCommandLineTools'),
        buildCheckbox(SCREENSHOT_KEY, 'settings.takeScreenshotShortcut'),
        buildCheckbox(HASH_KEY, 'settings.downloadHashShortcut'),
        buildCheckbox(NPM_IPFS_KEY, 'settings.npmOnIpfs')
      ]
    },
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
        },
        {
          label: i18n.t('moveRepositoryLocation'),
          click: () => { moveRepositoryLocation(ctx) }
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
          label: `ipfs-desktop ${VERSION}`,
          click: () => { shell.openExternal('https://github.com/ipfs-shipyard/ipfs-desktop/releases') }
        },
        {
          label: `go-ipfs ${GO_IPFS_VERSION}`,
          click: () => { shell.openExternal('https://github.com/ipfs/go-ipfs/releases') }
        },
        { type: 'separator' },
        {
          label: i18n.t('checkForUpdates'),
          click: () => { ctx.checkForUpdates() }
        },
        {
          label: i18n.t('viewOnGitHub'),
          click: () => { shell.openExternal('https://github.com/ipfs-shipyard/ipfs-desktop/blob/master/README.md') }
        }
      ]
    },
    {
      label: i18n.t('quit'),
      click: () => { app.quit() },
      accelerator: IS_MAC ? 'Command+Q' : null
    }
  ])
}

const on = 'on'
const off = 'off'

function icon (color) {
  const dir = path.resolve(path.join(__dirname, '../assets/icons/tray'))

  if (!IS_MAC) {
    return path.join(dir, `${color}-big.png`)
  }

  return path.join(dir, `${color}-22Template.png`)
}

module.exports = function (ctx) {
  logger.info('[tray] starting')
  const tray = new Tray(icon(off))
  let menu = null
  let status = {}

  // macOS tray drop files
  tray.on('drop-files', async (_, files) => {
    await addToIpfs(ctx, files)
    ctx.launchWebUI('/files', { focus: false })
  })

  if (!IS_MAC) {
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

    menu.on('menu-will-show', () => { ipcMain.emit('menubar-will-open') })
    menu.on('menu-will-close', () => { ipcMain.emit('menubar-will-close') })

    updateStatus(status)
    updateConfig()
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

    menu.getMenuItemById('takeScreenshot').enabled = menu.getMenuItemById('ipfsIsRunning').visible
    menu.getMenuItemById('downloadHash').enabled = menu.getMenuItemById('ipfsIsRunning').visible

    if (status === STATUS.STARTING_FINISHED) {
      tray.setImage(icon(on))
    } else {
      tray.setImage(icon(off))
    }

    if (!IS_MAC && !IS_WIN) {
      // On Linux, in order for changes made to individual MenuItems to take effect,
      // you have to call setContextMenu again - https://electronjs.org/docs/api/tray
      tray.setContextMenu(menu)
    }
  }

  const updateConfig = () => {
    for (const key of CONFIG_KEYS) {
      menu.getMenuItemById(key).checked = store.get(key, false)
    }
  }

  ipcMain.on('ipfsd', (status) => { updateStatus(status) })
  ipcMain.on('languageUpdated', () => { setupMenu(status) })
  ipcMain.on('configUpdated', (config) => { updateConfig(config) })
  setupMenu()

  ctx.tray = tray
  logger.info('[tray] started')
}
