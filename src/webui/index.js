const { screen, BrowserWindow, ipcMain, app, session } = require('electron')
const { join } = require('path')
const { URL } = require('url')
const serve = require('electron-serve')
const os = require('os')
const openExternal = require('./open-external')
const logger = require('../common/logger')
const store = require('../common/store')
const dock = require('../utils/dock')
const { VERSION, ELECTRON_VERSION } = require('../common/consts')
const createToggler = require('../utils/create-toggler')

serve({ scheme: 'webui', directory: join(__dirname, '../../assets/webui') })

const CONFIG_KEY = 'openWebUIAtLaunch'

const createWindow = () => {
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

  // open devtools with: DEBUG=ipfs-desktop ipfs-desktop
  if (process.env.DEBUG && process.env.DEBUG.match(/ipfs-desktop/)) {
    window.webContents.openDevTools()
  }

  window.webContents.on('render-process-gone', (_, { reason, exitCode }) => {
    logger.error(`[web ui] crashed: ${reason}, code: ${exitCode}`)
  })

  window.webContents.on('unresponsive', () => {
    logger.error('[web ui] the webui became unresponsive')
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

  const window = createWindow(ctx)
  let apiAddress = null

  ctx.webui = window

  const url = new URL('/', 'webui://-')
  url.hash = '/blank'
  url.searchParams.set('deviceId', ctx.countlyDeviceId)

  ctx.launchWebUI = (path, { focus = true, forceRefresh = false } = {}) => {
    if (forceRefresh) window.webContents.reload()
    if (!path) {
      logger.info('[web ui] launching web ui')
    } else {
      logger.info(`[web ui] navigate to ${path}`)
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
  }

  function updateLanguage () {
    url.searchParams.set('lng', store.get('language'))
  }

  ipcMain.on('ipfsd', async () => {
    const ipfsd = await ctx.getIpfsd(true)

    if (ipfsd && ipfsd.apiAddr !== apiAddress) {
      apiAddress = ipfsd.apiAddr
      url.searchParams.set('api', apiAddress)
      updateLanguage()
      window.loadURL(url.toString())
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
