const { Menu, Tray, shell, app, ipcMain, nativeTheme } = require('electron')
const i18n = require('i18next')
const path = require('path')
const os = require('os')
const fs = require('fs-extra')
const addToIpfs = require('./add-to-ipfs')
const logger = require('./common/logger')
const store = require('./common/store')
const moveRepositoryLocation = require('./move-repository-location')
const runGarbageCollector = require('./run-gc')
const ipcMainEvents = require('./common/ipc-main-events')
const { setCustomBinary, clearCustomBinary, hasCustomBinary } = require('./custom-ipfs-binary')
const { STATUS } = require('./daemon')
const { IS_MAC, VERSION, KUBO_VERSION } = require('./common/consts')

const CONFIG_KEYS = require('./common/config-keys')

const { SHORTCUT: SCREENSHOT_SHORTCUT, takeScreenshot } = require('./take-screenshot')
const { isSupported: supportsLaunchAtLogin } = require('./auto-launch')
const createToggler = require('./utils/create-toggler')
const getCtx = require('./context')

function buildCheckbox (key, label) {
  return {
    id: key,
    label: i18n.t(label),
    click: () => { ipcMain.emit(ipcMainEvents.TOGGLE(key)) },
    type: 'checkbox',
    checked: false
  }
}

// Notes on this: we are only supporting accelerators on macOS for now because
// they natively work as soon as the menu opens. They don't work like that on Windows
// or other OSes and must be registered globally. They still collide with global
// accelerator. Please see ../utils/setup-global-shortcut.js for more info.
/**
 * Note: This method needs to be called any time the menu item labels need updated. i.e. when the language changes.
 * @returns {Promise<Omit<Electron.Menu, 'getMenuItemById'> & {getMenuItemById: (id: string) => Electron.MenuItem}>}
 */
async function buildMenu () {
  const ctx = getCtx()
  const restartIpfs = ctx.getFn('restartIpfs')
  const startIpfs = ctx.getFn('startIpfs')
  const stopIpfs = ctx.getFn('stopIpfs')
  const launchWebUI = ctx.getFn('launchWebUI')
  const manualCheckForUpdates = ctx.getFn('manualCheckForUpdates')
  /**
   * we need to wait for i18n to be ready before we translate the tray menu
   * @type {boolean}
   */
  await ctx.getProp('i18n.initDone')

  // @ts-expect-error
  return Menu.buildFromTemplate([
    // @ts-ignore
    ...[
      ['ipfsIsStarting', 'yellow'],
      ['ipfsIsRunning', 'green'],
      ['ipfsIsStopping', 'yellow'],
      ['ipfsIsNotRunning', 'gray'],
      ['ipfsHasErrored', 'red'],
      ['runningWithGC', 'yellow'],
      ['runningWhileCheckingForUpdate', 'yellow']
    ].map(([status, color]) => ({
      id: status,
      label: i18n.t(status),
      visible: false,
      enabled: false,
      icon: path.resolve(path.join(__dirname, `../assets/icons/status/${color}.png`))
    })),
    // @ts-ignore
    {
      id: 'restartIpfs',
      label: i18n.t('restart'),
      click: () => { restartIpfs() },
      visible: false,
      accelerator: IS_MAC ? 'Command+R' : null
    },
    // @ts-ignore
    {
      id: 'startIpfs',
      label: i18n.t('start'),
      click: () => { startIpfs() },
      visible: false
    },
    // @ts-ignore
    {
      id: 'stopIpfs',
      label: i18n.t('stop'),
      click: () => { stopIpfs() },
      visible: false
    },
    // @ts-ignore
    { type: 'separator' },
    // @ts-ignore
    {
      id: 'webuiStatus',
      label: i18n.t('status'),
      click: () => { launchWebUI('/') }
    },
    // @ts-ignore
    {
      id: 'webuiFiles',
      label: i18n.t('files'),
      click: () => { launchWebUI('/files') }
    },
    // @ts-ignore
    {
      id: 'webuiPeers',
      label: i18n.t('peers'),
      click: () => { launchWebUI('/peers') }
    },
    // @ts-ignore
    { type: 'separator' },
    // @ts-ignore
    {
      id: 'takeScreenshot',
      label: i18n.t('takeScreenshot'),
      click: () => { takeScreenshot() },
      accelerator: IS_MAC ? SCREENSHOT_SHORTCUT : null,
      enabled: false
    },
    // @ts-ignore
    { type: 'separator' },
    // @ts-ignore
    {
      label: IS_MAC ? i18n.t('settings.preferences') : i18n.t('settings.settings'),
      submenu: [
        {
          id: 'webuiNodeSettings',
          label: i18n.t('settings.openNodeSettings'),
          click: () => { launchWebUI('/settings') }
        },
        { type: 'separator' },
        {
          label: i18n.t('settings.appPreferences'),
          enabled: false
        },
        buildCheckbox(CONFIG_KEYS.AUTO_LAUNCH, 'settings.launchOnStartup'),
        buildCheckbox(CONFIG_KEYS.OPEN_WEBUI_LAUNCH, 'settings.openWebUIAtLaunch'),
        buildCheckbox(CONFIG_KEYS.AUTO_GARBAGE_COLLECTOR, 'settings.automaticGC'),
        buildCheckbox(CONFIG_KEYS.SCREENSHOT_SHORTCUT, 'settings.takeScreenshotShortcut'),
        ...(IS_MAC ? [] : [buildCheckbox(CONFIG_KEYS.MONOCHROME_TRAY_ICON, 'settings.monochromeTrayIcon')]),
        { type: 'separator' },
        {
          label: i18n.t('settings.experiments'),
          enabled: false
        },
        buildCheckbox(CONFIG_KEYS.EXPERIMENT_PUBSUB, 'settings.pubsub'),
        buildCheckbox(CONFIG_KEYS.EXPERIMENT_PUBSUB_NAMESYS, 'settings.namesysPubsub')
      ]
    },
    // @ts-ignore
    {
      label: i18n.t('advanced'),
      submenu: [
        {
          label: i18n.t('openLogsDir'),
          click: () => { shell.openPath(app.getPath('userData')) }
        },
        {
          label: i18n.t('openConfigFile'),
          click: () => { shell.openPath(store.path) }
        },
        { type: 'separator' },
        {
          id: 'openRepoDir',
          label: i18n.t('openRepoDir'),
          click: () => { shell.openPath(getKuboRepositoryPath()) }
        },
        {
          id: 'openKuboConfigFile',
          label: i18n.t('openKuboConfigFile'),
          click: () => { shell.openPath(path.join(getKuboRepositoryPath(), 'config')) }
        },
        { type: 'separator' },
        {
          id: 'runGarbageCollector',
          label: i18n.t('runGarbageCollector'),
          click: () => { runGarbageCollector() },
          enabled: false
        },
        { type: 'separator' },
        {
          id: 'moveRepositoryLocation',
          label: i18n.t('moveRepositoryLocation'),
          click: () => { moveRepositoryLocation() }
        },
        {
          id: 'setCustomBinary',
          label: i18n.t('setCustomIpfsBinary'),
          click: () => { setCustomBinary() },
          visible: false
        },
        {
          id: 'clearCustomBinary',
          label: i18n.t('clearCustomIpfsBinary'),
          click: () => { clearCustomBinary() },
          visible: false
        }
      ]
    },
    // @ts-ignore
    {
      label: i18n.t('about'),
      submenu: [
        {
          label: i18n.t('versions'),
          enabled: false
        },
        {
          label: `ipfs-desktop ${VERSION}`,
          click: () => { shell.openExternal(`https://github.com/ipfs-shipyard/ipfs-desktop/releases/v${VERSION}`) }
        },
        {
          label: hasCustomBinary()
            ? i18n.t('customIpfsBinary')
            : `kubo ${KUBO_VERSION}`,
          click: () => { shell.openExternal(`https://github.com/ipfs/kubo/releases/v${KUBO_VERSION.replace(/^\^/, '')}`) }
        },
        { type: 'separator' },
        {
          id: 'checkForUpdates',
          label: i18n.t('checkForUpdates'),
          click: () => { manualCheckForUpdates() }
        },
        {
          id: 'checkingForUpdates',
          label: i18n.t('checkingForUpdates'),
          enabled: false
        },
        { type: 'separator' },
        {
          label: i18n.t('viewOnGitHub'),
          click: () => { shell.openExternal('https://github.com/ipfs-shipyard/ipfs-desktop/blob/master/README.md') }
        },
        {
          label: i18n.t('helpUsTranslate'),
          click: () => { shell.openExternal('https://www.transifex.com/ipfs/public/') }
        }
      ]
    },
    // @ts-ignore
    {
      label: i18n.t('quit'),
      click: () => { app.quit() },
      accelerator: IS_MAC ? 'Command+Q' : null
    }
  ])
}

const on = 'on'
const off = 'off'

function icon (status) {
  const dir = path.resolve(path.join(__dirname, '../assets/icons/tray'))

  if (IS_MAC) {
    return path.join(dir, 'macos', `${status}-22Template.png`)
  }

  const bw = store.get(CONFIG_KEYS.MONOCHROME_TRAY_ICON, false)
  if (bw) {
    const theme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
    return path.join(dir, 'others', `${status}-32-${theme}.png`)
  } else {
    return path.join(dir, 'others', `${status}-large.png`)
  }
}

// Ok this one is pretty ridiculous:
// Tray must be global or it will break due to GC:
// https://www.electronjs.org/docs/faq#my-apps-tray-disappeared-after-a-few-minutes
let tray = null

module.exports = async function () {
  const ctx = getCtx()
  logger.info('[tray] starting')
  tray = new Tray(icon(off))
  tray.setToolTip('IPFS Desktop')

  const launchWebUI = ctx.getFn('launchWebUI')

  // this state needs to be mutable so menu can update visible/hidden and enabled/disabled menu items
  const state = {
    status: null,
    gcRunning: false,
    isUpdating: false
  }

  // macOS tray drop files
  tray.on('drop-files', async (_, files) => {
    await addToIpfs(files)

    launchWebUI('/files', { focus: false })
  })

  const popupMenu = (event) => {
    // https://github.com/ipfs-shipyard/ipfs-desktop/issues/1762 ¯\_(ツ)_/¯
    if (event && typeof event.preventDefault === 'function') event.preventDefault()

    tray.popUpContextMenu()
  }

  if (!IS_MAC) {
    // Show the context menu on left click on other
    // platforms than macOS.
    tray.on('click', popupMenu)
  }
  tray.on('right-click', popupMenu)
  tray.on('double-click', async () => launchWebUI('/'))

  ctx.setProp('tray.update-menu', async () => {
    logger.fileLogger.debug('[tray.update-menu] updating tray menu')
    const { status, gcRunning, isUpdating } = state
    const errored = status === STATUS.STARTING_FAILED || status === STATUS.STOPPING_FAILED
    const menu = await buildMenu() // new menu instance every time
    menu.on('menu-will-show', () => { ipcMain.emit(ipcMainEvents.MENUBAR_OPEN) })
    menu.on('menu-will-close', () => { ipcMain.emit(ipcMainEvents.MENUBAR_CLOSE) })

    menu.getMenuItemById('ipfsIsStarting').visible = status === STATUS.STARTING_STARTED && !gcRunning && !isUpdating
    menu.getMenuItemById('ipfsIsRunning').visible = status === STATUS.STARTING_FINISHED && !gcRunning && !isUpdating
    menu.getMenuItemById('ipfsIsStopping').visible = status === STATUS.STOPPING_STARTED && !gcRunning && !isUpdating
    menu.getMenuItemById('ipfsIsNotRunning').visible = status === STATUS.STOPPING_FINISHED && !gcRunning && !isUpdating
    menu.getMenuItemById('ipfsHasErrored').visible = errored && !gcRunning && !isUpdating
    menu.getMenuItemById('runningWithGC').visible = gcRunning
    menu.getMenuItemById('runningWhileCheckingForUpdate').visible = isUpdating

    menu.getMenuItemById('startIpfs').visible = status === STATUS.STOPPING_FINISHED
    menu.getMenuItemById('stopIpfs').visible = status === STATUS.STARTING_FINISHED
    menu.getMenuItemById('restartIpfs').visible = (status === STATUS.STARTING_FINISHED || errored)

    menu.getMenuItemById('webuiStatus').enabled = status === STATUS.STARTING_FINISHED
    menu.getMenuItemById('webuiFiles').enabled = status === STATUS.STARTING_FINISHED
    menu.getMenuItemById('webuiPeers').enabled = status === STATUS.STARTING_FINISHED
    menu.getMenuItemById('webuiNodeSettings').enabled = status === STATUS.STARTING_FINISHED

    menu.getMenuItemById('startIpfs').enabled = !gcRunning
    menu.getMenuItemById('stopIpfs').enabled = !gcRunning
    menu.getMenuItemById('restartIpfs').enabled = !gcRunning

    menu.getMenuItemById(CONFIG_KEYS.AUTO_LAUNCH).enabled = supportsLaunchAtLogin()
    menu.getMenuItemById('takeScreenshot').enabled = status === STATUS.STARTING_FINISHED

    menu.getMenuItemById('moveRepositoryLocation').enabled = !gcRunning && status !== STATUS.STOPPING_STARTED
    menu.getMenuItemById('runGarbageCollector').enabled = menu.getMenuItemById('ipfsIsRunning').visible && !gcRunning

    menu.getMenuItemById('setCustomBinary').visible = !hasCustomBinary()
    menu.getMenuItemById('clearCustomBinary').visible = hasCustomBinary()

    menu.getMenuItemById('checkForUpdates').enabled = !isUpdating
    menu.getMenuItemById('checkForUpdates').visible = !isUpdating
    menu.getMenuItemById('checkingForUpdates').visible = isUpdating

    menu.getMenuItemById('openRepoDir').enabled = fs.pathExistsSync(getKuboRepositoryPath())
    menu.getMenuItemById('openKuboConfigFile').enabled = fs.pathExistsSync(path.join(getKuboRepositoryPath(), 'config'))

    if (status === STATUS.STARTING_FINISHED) {
      tray.setImage(icon(on))
    } else {
      tray.setImage(icon(off))
    }

    // Update configuration checkboxes.
    for (const key of Object.values(CONFIG_KEYS)) {
      const enabled = store.get(key, false)
      const item = menu.getMenuItemById(key)
      if (item) {
        // Not all items are present in all platforms.
        item.checked = enabled
      }
    }

    tray.setContextMenu(menu) // this is needed on macOS too, otherwise the menu won't update
  })
  const updateMenu = ctx.getFn('tray.update-menu')

  ipcMain.on(ipcMainEvents.IPFSD, status => {
    // @ts-ignore
    state.status = status
    updateMenu()
  })

  ipcMain.on(ipcMainEvents.GC_RUNNING, () => {
    state.gcRunning = true
    updateMenu()
  })

  ipcMain.on(ipcMainEvents.GC_ENDED, () => {
    state.gcRunning = false
    updateMenu()
  })

  ipcMain.on(ipcMainEvents.UPDATING, () => {
    state.isUpdating = true
    updateMenu()
  })

  ipcMain.on(ipcMainEvents.UPDATING_ENDED, () => {
    state.isUpdating = false
    updateMenu()
  })

  ipcMain.on(ipcMainEvents.CONFIG_UPDATED, () => { updateMenu() })
  ipcMain.on(ipcMainEvents.LANG_UPDATED_SUCCEEDED, () => { updateMenu() })

  nativeTheme.on('updated', () => {
    updateMenu()
  })

  await updateMenu()

  createToggler(CONFIG_KEYS.MONOCHROME_TRAY_ICON, async ({ newValue }) => {
    return store.safeSet(CONFIG_KEYS.MONOCHROME_TRAY_ICON, newValue, () => true)
  })

  ctx.setProp('tray', tray)
  logger.info('[tray] started')
}

function getKuboRepositoryPath () {
  let ipfsPath = store.get('ipfsConfig.path')
  if (!ipfsPath) {
    ipfsPath = process.env.IPFS_PATH
    if (!ipfsPath) {
      const homeDir = os.homedir()
      ipfsPath = path.join(homeDir, '.ipfs')
    }
  }
  return ipfsPath
}
