// @ts-check
const { screen, BrowserWindow, ipcMain, app, session } = require('electron')
const { join } = require('path')
const { URL } = require('url')
const serve = require('electron-serve')
const i18n = require('i18next')
const openExternal = require('./open-external')
const logger = require('../common/logger')
const store = require('../common/store')
const { OPEN_WEBUI_LAUNCH: CONFIG_KEY } = require('../common/config-keys')
const dock = require('../utils/dock')
const { VERSION, ELECTRON_VERSION } = require('../common/consts')
const createToggler = require('../utils/create-toggler')
const { showDialog } = require('../dialogs')
const { getSecondsSinceAppStart } = require('../metrics/appStart')
const { performance } = require('perf_hooks')
const Countly = require('countly-sdk-nodejs')
const { analyticsKeys } = require('../analytics/keys')
const ipcMainEvents = require('../common/ipc-main-events')
const getCtx = require('../context')
const { STATUS } = require('../daemon/consts')

serve({ scheme: 'webui', directory: join(__dirname, '../../assets/webui') })

/**
 *
 * @returns {BrowserWindow}
 */
const createWindow = () => {
  logger.info('[webui] creating window')
  const dimensions = screen.getPrimaryDisplay()

  const window = new BrowserWindow({
    title: 'IPFS Desktop',
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    width: store.get('window.width', dimensions.width < 1440 ? dimensions.width : 1440),
    height: store.get('window.height', dimensions.height < 900 ? dimensions.height : 900),
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      webSecurity: false,
      allowRunningInsecureContent: false,
      enableRemoteModule: process.env.NODE_ENV === 'test', // https://github.com/electron-userland/spectron/pull/738#issuecomment-754810364
      nodeIntegration: process.env.NODE_ENV === 'test'
    }
  })

  window.webContents.once('did-start-loading', (event) => {
    const msg = '[web ui] loading'
    const webContentLoad = logger.start(msg, { withAnalytics: analyticsKeys.WEB_UI_READY })
    window.webContents.once('did-finish-load', () => {
      webContentLoad.end()
    })
    window.webContents.once('did-fail-load', (_, errorCode, errorDescription) => {
      webContentLoad.fail(`${msg}: ${errorDescription}, code: ${errorCode}`)
    })
  })
  window.webContents.once('dom-ready', async (event) => {
    const endTime = performance.now()
    try {
      const dur = getSecondsSinceAppStart(endTime)
      logger.info(`[App] startup time - ${dur} seconds`)
      Countly.add_event({
        key: 'APP_START_TO_DOM_READY',
        count: 1,
        dur
      })
    } catch (err) {
      logger.error(err)
    }
  })

  // open devtools with: DEBUG=ipfs-desktop
  if (process.env.DEBUG && process.env.DEBUG.match(/ipfs-desktop/)) {
    window.webContents.openDevTools()
  }

  window.webContents.on('render-process-gone', (_, { reason, exitCode }) => {
    logger.error(`[web ui] render-process-gone: ${reason}, code: ${exitCode}`)
  })

  window.webContents.on('unresponsive', async () => {
    logger.error('[web ui] the webui became unresponsive')

    const opt = showDialog({
      title: i18n.t('unresponsiveWindowDialog.title'),
      message: i18n.t('unresponsiveWindowDialog.message'),
      buttons: [
        i18n.t('unresponsiveWindowDialog.forceReload'),
        i18n.t('unresponsiveWindowDialog.doNothing')
      ]
    })

    if (opt === 0) {
      window.webContents.forcefullyCrashRenderer()
      window.webContents.reload()
    }
  })

  window.on('resize', () => {
    const dim = window.getSize()
    store.safeSet('window.width', dim[0])
    store.safeSet('window.height', dim[1])
  })

  window.on('close', (event) => {
    event.preventDefault()
    window.hide()
    dock.hide()
    logger.info('[web ui] window hidden')
  })

  app.on('before-quit', () => {
    logger.info('[web ui] app-quit requested')
    // Makes sure the app quits even though we prevent
    // the closing of this window.
    window.removeAllListeners('close')
  })

  return window
}

module.exports = async function () {
  logger.info('[webui] init...')
  const ctx = getCtx()

  if (store.get(CONFIG_KEY, null) === null) {
    // First time running this. Enable opening ipfs-webui at app launch.
    // This accounts for users on OSes who may have extensions for
    // decluttering system menus/trays, and thus have no initial "way in" to
    // Desktop upon install:
    // https://github.com/ipfs-shipyard/ipfs-desktop/issues/1741
    store.safeSet(CONFIG_KEY, true)
  }

  createToggler(CONFIG_KEY, async ({ newValue }) => {
    store.safeSet(CONFIG_KEY, newValue)
    return true
  })

  openExternal()
  const window = createWindow()
  ctx.setProp('webui', window)
  let apiAddress = null

  const url = new URL('/', 'webui://-')
  url.hash = '/blank'
  url.searchParams.set('deviceId', await ctx.getProp('countlyDeviceId'))

  ctx.setProp('launchWebUI', async (path, { focus = true, forceRefresh = false } = {}) => {
    if (window.isDestroyed()) {
      logger.error(`[web ui] window is destroyed, not launching web ui with ${path}`)
      return
    }
    if (forceRefresh) window.webContents.reload()
    if (!path) {
      logger.info('[web ui] launching web ui', { withAnalytics: analyticsKeys.FN_LAUNCH_WEB_UI })
    } else {
      logger.info(`[web ui] navigate to ${path}`, { withAnalytics: analyticsKeys.FN_LAUNCH_WEB_UI_WITH_PATH })
      url.hash = path
      window.webContents.loadURL(url.toString())
    }
    if (focus) {
      window.show()
      window.focus()
      dock.show()
    }
    // load again: minimize visual jitter on windows
    if (path) window.webContents.loadURL(url.toString())
  })

  function updateLanguage () {
    url.searchParams.set('lng', store.get('language'))
  }

  const getIpfsd = ctx.getFn('getIpfsd')
  let ipfsdStatus = null
  ipcMain.on(ipcMainEvents.IPFSD, async (status) => {
    const ipfsd = await getIpfsd(true)
    ipfsdStatus = status

    if (ipfsd && ipfsd.apiAddr !== apiAddress) {
      apiAddress = ipfsd.apiAddr
      url.searchParams.set('api', apiAddress.toString())
      updateLanguage()
      window.loadURL(url.toString())
    }
  })

  // Set user agent
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = `ipfs-desktop/${VERSION} (Electron ${ELECTRON_VERSION})`
    callback({ cancel: false, requestHeaders: details.requestHeaders }) // eslint-disable-line
  })

  const launchWebUI = ctx.getFn('launchWebUI')
  const splashScreen = await ctx.getProp('splashScreen')
  if (store.get(CONFIG_KEY)) {
    // we're supposed to show the window on startup, display the splash screen
    splashScreen.show()
  } else {
    // we don't need the splash screen, ignore it.
    splashScreen.destroy()
  }
  let splashScreenTimeoutId = null
  window.on('close', () => {
    if (splashScreenTimeoutId) {
      clearTimeout(splashScreenTimeoutId)
      splashScreenTimeoutId = null
    }
  })
  const handleSplashScreen = async () => {
    if ([null, STATUS.STARTING_STARTED].includes(ipfsdStatus)) {
      splashScreenTimeoutId = setTimeout(handleSplashScreen, 500)
      return
    }

    await launchWebUI('/')
    try {
      splashScreen.destroy()
    } catch (err) {
      logger.error('[web ui] failed to hide splash screen')
      logger.error(err)
    }
  }

  return /** @type {Promise<void>} */(new Promise(resolve => {
    if (store.get(CONFIG_KEY)) {
      logger.info('[web ui] waiting for ipfsd to start')
      window.once('ready-to-show', async () => {
        logger.info('[web ui] window ready')

        handleSplashScreen()

        resolve()
      })
    }

    updateLanguage()
    window.loadURL(url.toString())
  }))
}
