// @ts-check
const { screen, BrowserWindow, ipcMain, app, session } = require('electron')
const { join } = require('path')
const { URL } = require('url')
const serve = require('electron-serve')
const os = require('os')
const i18n = require('i18next')
const openExternal = require('./open-external')
const logger = require('../common/logger')
const store = require('../common/store')
const dock = require('../utils/dock')
const { VERSION, ELECTRON_VERSION, IS_WIN, IPFS_DEBUG } = require('../common/consts')
const createToggler = require('../utils/create-toggler')
const { showDialog } = require('../dialogs')
const electronAppReady = require('../electronAppReady')
const handleError = require('../handleError')
const { getAppStartTime } = require('../metrics/registerAppStartTime')
const { performance } = require('perf_hooks')

const loadURL = serve({
  scheme: 'webui',
  directory: join(__dirname, '../../assets/webui'),
  isCorsEnabled: !IPFS_DEBUG
})

const CONFIG_KEY = 'openWebUIAtLaunch'

const createWindow = async () => {
  await electronAppReady()
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
    console.log('event: ', event)
    const title = event?.sender?.getTitle()
    const url = event?.sender?.getURL()
    const loggerId = `[web ui] loading - ${title} @ ${url}`
    const webContentLoad = logger.start(loggerId, { withAnalytics: 'WEB_CONTENT_LOAD_TIME' })
    window.webContents.once('did-finish-load', (event, input) => {
      webContentLoad.end()
    })
    window.webContents.once('did-fail-load', (_, errorCode, errorDescription) => {
      webContentLoad.fail(`${loggerId}: ${errorDescription}, code: ${errorCode}`)
    })
  })
  window.webContents.once('dom-ready', (event) => {
    const endTime = performance.now()
    const dur = (endTime - getAppStartTime()) / 1000
    logger.info(`[App] startup time - ${dur} seconds`)
    require('countly-sdk-nodejs').add_event({
      key: 'APP_STARTUP_TIME',
      count: 1,
      dur
    })
  })

  // open devtools with: DEBUG=ipfs-desktop
  if (IPFS_DEBUG) {
    window.webContents.openDevTools()
    const events = [
      'responsive',
      'did-finish-load',
      'before-input-event',
      'blur',
      'certificate-error',
      'console-message',
      'context-menu',
      'crashed',
      'cursor-changed',
      'destroyed',
      'devtools-closed',
      'devtools-focused',
      'devtools-opened',
      'devtools-reload-page',
      'did-attach-webview',
      'did-change-theme-color',
      'did-create-window',
      'did-fail-load',
      'did-fail-provisional-load',
      'did-frame-finish-load',
      'did-frame-navigate',
      'did-navigate',
      'did-navigate-in-page',
      'did-redirect-navigation',
      'did-start-loading',
      'did-start-navigation',
      'did-stop-loading',
      'dom-ready',
      'enter-html-full-screen',
      'focus',
      'found-in-page',
      'frame-created',
      'ipc-message',
      'ipc-message-sync',
      'leave-html-full-screen',
      'login',
      'media-paused',
      'media-started-playing',
      'new-window',
      'page-favicon-updated',
      'page-title-updated',
      'paint',
      'plugin-crashed',
      'preferred-size-changed',
      'preload-error',
      'render-process-gone',
      'responsive',
      'select-bluetooth-device',
      'select-client-certificate',
      'unresponsive',
      'update-target-url',
      'will-attach-webview',
      'will-navigate',
      'will-prevent-unload',
      'will-redirect',
      'zoom-changed'
    ]
    events.forEach((eventName) => {
      window.webContents.on(eventName, (event, input) => {
        console.log(`webcontent '${eventName}' event:`, input)
      })
    })
  }

  window.webContents.on('render-process-gone', (_, { reason, exitCode }) => {
    logger.error(`[web ui] render-process-gone: ${reason}, code: ${exitCode}`)
  })

  window.webContents.on('unresponsive', async () => {
    logger.error('[web ui] the webui became unresponsive')

    try {
      const opt = await showDialog({
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
    } catch (err) {
      handleError(err)
    }
  })

  window.on('resize', () => {
    const dim = window.getSize()
    store.set('window.width', dim[0])
    store.set('window.height', dim[1])
  })

  window.on('close', (event) => {
    event.preventDefault()
    window.hide()
    dock.hide()
    logger.info('[web ui] window hidden')
  })

  app.on('before-quit', () => {
    // Makes sure the app quits even though we prevent
    // the closing of this window.
    window.removeAllListeners('close')
  })

  return window
}

/**
 *
 * @param {Awaited<import('../context')>} ctx
 */
module.exports = async function (ctx) {
  if (store.get(CONFIG_KEY, null) === null) {
    // First time running this. Enable opening ipfs-webui at app launch.
    // This accounts for users on OSes who may have extensions for
    // decluttering system menus/trays, and thus have no initial "way in" to
    // Desktop upon install:
    // https://github.com/ipfs-shipyard/ipfs-desktop/issues/1741
    store.set(CONFIG_KEY, true)
  }

  createToggler(CONFIG_KEY, async ({ newValue }) => {
    store.set(CONFIG_KEY, newValue)
    return true
  })

  openExternal()

  const window = await createWindow()
  let apiAddress = null

  ctx.webui = window

  const url = new URL('/', 'webui://-')
  url.hash = '/blank'
  url.searchParams.set('deviceId', ctx.countlyDeviceId)

  ctx.launchWebUI = async (path, { focus = true, forceRefresh = false } = {}) => {
    if (forceRefresh) window.webContents.reload()
    if (!path) {
      logger.info('[web ui] launching web ui', { withAnalytics: 'LAUNCH_WEBUI_CALL' })
    } else {
      logger.info(`[web ui] navigate to ${path}`, { withAnalytics: 'LAUNCH_WEBUI_CALL_NAVIGATE' })
      console.log('path: ', path)
      url.hash = path
      try {
        await loadURL(window)
        // window.webContents.loa
        // await window.webContents.loadURL(url.toString())
      } catch (err) {
        logger.error(err)
        logger.error(err.stack)
      }
    }
    if (focus) {
      window.show()
      window.focus()
      dock.show()
    }
    // load again: minimize visual jitter on windows
    if (path && IS_WIN) await loadURL(window) // await window.webContents.loadURL(url.toString())
  }

  function updateLanguage () {
    url.searchParams.set('lng', store.get('language'))
  }

  ipcMain.on('ipfsd', async () => {
    const ipfsd = await ctx.getIpfsd(true)

    if (ipfsd && ipfsd.apiAddr !== apiAddress) {
      apiAddress = ipfsd.apiAddr
      url.searchParams.set('api', apiAddress.toString())
      updateLanguage()
      // window.loadURL(url.toString())
      // await loadURL(window)
    }
  })

  ipcMain.on('config.get', () => {
    window.webContents.send('config.changed', {
      platform: os.platform(),
      config: store.store
    })
  })

  // Set user agent
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = `ipfs-desktop/${VERSION} (Electron ${ELECTRON_VERSION})`
    callback({ cancel: false, requestHeaders: details.requestHeaders }) // eslint-disable-line
  })

  return new Promise(resolve => {
    window.once('ready-to-show', () => {
      logger.info('[web ui] window ready')

      if (store.get(CONFIG_KEY)) {
        ctx.launchWebUI('/')
      }

      resolve()
    })

    updateLanguage()
    window.loadURL(url.toString())
  })
}

module.exports.CONFIG_KEY = CONFIG_KEY
