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
const { VERSION } = require('../common/consts')

serve({ scheme: 'webui', directory: join(__dirname, '../../assets/webui') })

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
  openExternal()

  const window = createWindow(ctx)
  let apiAddress = null

  ctx.webui = window

  ctx.launchWebUI = (url, { focus = true } = {}) => {
    if (!url) {
      logger.info('[web ui] launching web ui')
    } else {
      logger.info(`[web ui] navigate to ${url}`)
      window.webContents.send('updatedPage', url)
    }

    if (focus) {
      window.show()
      window.focus()
      dock.show()
    }
  }

  const url = new URL('/', 'webui://-')
  url.hash = '/blank'
  url.searchParams.set('deviceId', ctx.countlyDeviceId)

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

  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    // Avoid setting CORS by acting like /webui loaded from API port
    details.requestHeaders.Origin = apiOrigin(apiAddress)
    details.requestHeaders['User-Agent'] = `ipfs-desktop/${VERSION}`
    callback({ cancel: false, requestHeaders: details.requestHeaders }) // eslint-disable-line
  })

  return new Promise(resolve => {
    window.once('ready-to-show', () => {
      logger.info('[web ui] window ready')
      resolve()
    })

    updateLanguage()
    window.loadURL(url.toString())
  })
}
