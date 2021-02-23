const { screen, BrowserWindow, ipcMain, app, session } = require('electron')
const { join } = require('path')
const { URL } = require('url')
const toUri = require('multiaddr-to-uri')
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
    fullscreenWindowTitle: true,
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

  window.webContents.on('crashed', event => {
    logger.error(`[web ui] crashed: ${event.toString()}`)
  })

  window.webContents.on('unresponsive', event => {
    logger.error(`[web ui] unresponsive: ${event.toString()}`)
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

// Converts a Multiaddr to a valid value for Origin HTTP header
const apiOrigin = (apiMultiaddr) => {
  // Return opaque origin when there is no API yet
  // https://html.spec.whatwg.org/multipage/origin.html#concept-origin-opaque
  if (!apiMultiaddr) return 'null'
  // Return the Origin of HTTP API
  const apiUri = toUri(apiMultiaddr, { assumeHttp: true })
  return new URL(apiUri).origin
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
      window.webContents.send('updatedPage', path)
      url.hash = path
    }

    if (focus) {
      window.show()
      window.focus()
      dock.show()
    }
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

  // Avoid setting CORS by acting like /webui loaded from API port
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders.Origin = apiOrigin(apiAddress)
    details.requestHeaders['User-Agent'] = `ipfs-desktop/${VERSION} (Electron ${ELECTRON_VERSION})`
    callback({ cancel: false, requestHeaders: details.requestHeaders }) // eslint-disable-line
  })

  // modify CORS preflight on the fly
  const webuiOrigin = 'webui://-'
  const acao = 'Access-Control-Allow-Origin'
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const { responseHeaders } = details
    // If Access-Control-Allow-Origin header is returned, override it to match webuiOrigin
    if (responseHeaders && responseHeaders[acao]) {
      responseHeaders[acao] = webuiOrigin
    }
    // eslint-disable-next-line
    callback({ responseHeaders })
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
