const { Menu, Tray, shell, app, ipcMain } = require('electron')
const i18n = require('i18next')
const path = require('path')
const addToIpfs = require('./add-to-ipfs')
const logger = require('./common/logger')
const store = require('./common/store')
const moveRepositoryLocation = require('./move-repository-location')
const runGarbageCollector = require('./run-gc')
const { STATUS } = require('./daemon')
const { IS_MAC, IS_WIN, VERSION, GO_IPFS_VERSION } = require('./common/consts')

const { CONFIG_KEY: SCREENSHOT_KEY, SHORTCUT: SCREENSHOT_SHORTCUT, takeScreenshot } = require('./take-screenshot')
const { CONFIG_KEY: DOWNLOAD_KEY, SHORTCUT: DOWNLOAD_SHORTCUT, downloadCid } = require('./download-cid')
const { CONFIG_KEY: AUTO_LAUNCH_KEY, isSupported: supportsLaunchAtLogin } = require('./auto-launch')
const { CONFIG_KEY: IPFS_PATH_KEY } = require('./ipfs-on-path')
const { CONFIG_KEY: NPM_IPFS_KEY } = require('./npm-on-ipfs')

const CONFIG_KEYS = [
  AUTO_LAUNCH_KEY,
  IPFS_PATH_KEY,
  NPM_IPFS_KEY,
  SCREENSHOT_KEY,
  DOWNLOAD_KEY
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
      ['ipfsHasErrored', 'red'],
      ['runningWithGC', 'yellow']
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
    {
      label: i18n.t('peers'),
      click: () => { ctx.launchWebUI('/peers') }
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
      id: 'downloadCid',
      label: i18n.t('downloadCid'),
      click: () => { downloadCid(ctx) },
      accelerator: IS_MAC ? DOWNLOAD_SHORTCUT : null,
      enabled: false
    },
    { type: 'separator' },
    {
      label: IS_MAC ? i18n.t('settings.preferences') : i18n.t('settings.settings'),
      submenu: [
        {
          label: i18n.t('settings.openNodeSettings'),
          click: () => { ctx.launchWebUI('/settings') }
        },
        { type: 'separator' },
        {
          label: i18n.t('settings.desktopIntegrations'),
          enabled: false
        },
        buildCheckbox(AUTO_LAUNCH_KEY, 'settings.launchOnStartup'),
        buildCheckbox(IPFS_PATH_KEY, 'settings.ipfsCommandLineTools'),
        buildCheckbox(SCREENSHOT_KEY, 'settings.takeScreenshotShortcut'),
        buildCheckbox(DOWNLOAD_KEY, 'settings.downloadHashShortcut'),
        { type: 'separator' },
        {
          label: i18n.t('settings.experiments'),
          enabled: false
        },
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
        { type: 'separator' },
        {
          id: 'moveRepositoryLocation',
          label: i18n.t('moveRepositoryLocation'),
          click: () => { moveRepositoryLocation(ctx) }
        },
        {
          id: 'runGarbageCollector',
          label: i18n.t('runGarbageCollector'),
          click: () => { runGarbageCollector(ctx) },
          enabled: false
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

  const state = {
    status: null,
    gcRunning: false
  }

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

    updateMenu()
  }

  const updateMenu = () => {
    const { status, gcRunning } = state
    const errored = status === STATUS.STARTING_FAILED || status === STATUS.STOPPING_FAILED

    menu.getMenuItemById('ipfsIsStarting').visible = status === STATUS.STARTING_STARTED && !gcRunning
    menu.getMenuItemById('ipfsIsRunning').visible = status === STATUS.STARTING_FINISHED && !gcRunning
    menu.getMenuItemById('ipfsIsStopping').visible = status === STATUS.STOPPING_STARTED && !gcRunning
    menu.getMenuItemById('ipfsIsNotRunning').visible = status === STATUS.STOPPING_FINISHED && !gcRunning
    menu.getMenuItemById('ipfsHasErrored').visible = errored && !gcRunning
    menu.getMenuItemById('runningWithGC').visible = gcRunning

    menu.getMenuItemById('startIpfs').visible = status === STATUS.STOPPING_FINISHED
    menu.getMenuItemById('stopIpfs').visible = status === STATUS.STARTING_FINISHED
    menu.getMenuItemById('restartIpfs').visible = (status === STATUS.STARTING_FINISHED || errored)

    menu.getMenuItemById('startIpfs').enabled = !gcRunning
    menu.getMenuItemById('stopIpfs').enabled = !gcRunning
    menu.getMenuItemById('restartIpfs').enabled = !gcRunning

    menu.getMenuItemById(AUTO_LAUNCH_KEY).enabled = supportsLaunchAtLogin()
    menu.getMenuItemById('takeScreenshot').enabled = status === STATUS.STARTING_FINISHED
    menu.getMenuItemById('downloadCid').enabled = status === STATUS.STARTING_FINISHED

    menu.getMenuItemById('moveRepositoryLocation').enabled = !gcRunning && status !== STATUS.STOPPING_STARTED
    menu.getMenuItemById('runGarbageCollector').enabled = menu.getMenuItemById('ipfsIsRunning').visible && !gcRunning

    if (status === STATUS.STARTING_FINISHED) {
      tray.setImage(icon(on))
    } else {
      tray.setImage(icon(off))
    }

    // Update configuration checkboxes.
    for (const key of CONFIG_KEYS) {
      menu.getMenuItemById(key).checked = store.get(key, false)
    }

    if (!IS_MAC && !IS_WIN) {
      // On Linux, in order for changes made to individual MenuItems to take effect,
      // you have to call setContextMenu again - https://electronjs.org/docs/api/tray
      tray.setContextMenu(menu)
    }
  }

  ipcMain.on('ipfsd', status => {
    state.status = status
    updateMenu()
  })

  ipcMain.on('gcRunning', () => {
    state.gcRunning = true
    updateMenu()
  })

  ipcMain.on('gcEnded', () => {
    state.gcRunning = false
    updateMenu()
  })

  ipcMain.on('configUpdated', () => { updateMenu() })
  ipcMain.on('languageUpdated', () => { setupMenu() })

  setupMenu()

  ctx.tray = tray
  logger.info('[tray] started')
}
