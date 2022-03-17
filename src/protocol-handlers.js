const { app, shell, ipcMain } = require('electron')
const toUri = require('multiaddr-to-uri')
const { CID } = require('multiformats/cid')
const i18n = require('i18next')
const fetch = require('node-fetch')
const createToggler = require('./utils/create-toggler')
const store = require('./common/store')
const { showPrompt } = require('./dialogs')

const CONFIG_KEY = 'askWhenOpeningIpfsURIs'
const CONFIG_KEY_ACTION = 'openIpfsURIsAction'

const ACTION_OPTIONS = {
  OPEN_IN_BROWSER: 'openInBrowser',
  OPEN_IN_IPFS_DESKTOP: 'openInIpfsDesktop'
  // BROWSER_PUBLIC_GATEWAY: 'browserPublicGateway',
  // BROWSER_LOCAL_GATEWAY: 'browserLocalGateway',
  // FILES_SCREEN: 'filesScreen'
  // EXPLORE_SCREEN: 'exploreScreen'
}

const DEFAULT_ACTION = ACTION_OPTIONS.OPEN_IN_BROWSER
const DEFAULT_GATEWAY = 'https://dweb.link'

const LOCAL_HOSTNAMES = ['127.0.0.1', '[::1]', '0.0.0.0', '[::]']

async function getAction () {
  const ask = store.get(CONFIG_KEY, true)
  if (!ask) {
    return store.get(CONFIG_KEY_ACTION, DEFAULT_ACTION)
  }

  const { button, input } = await showPrompt({
    title: i18n.t('protocolHandlerDialog.title'),
    message: i18n.t('protocolHandlerDialog.message'),
    inputs: [
      {
        type: 'radio',
        name: 'action',
        defaultValue: DEFAULT_ACTION,
        labels: {
          [ACTION_OPTIONS.OPEN_IN_BROWSER]: i18n.t('protocolHandlerDialog.openInBrowser'),
          [ACTION_OPTIONS.OPEN_IN_IPFS_DESKTOP]: i18n.t('protocolHandlerDialog.openInIpfsDesktop')
          // [ACTION_OPTIONS.BROWSER_PUBLIC_GATEWAY]: i18n.t('protocolHandlerDialog.browserPublicGateway'),
          // [ACTION_OPTIONS.BROWSER_LOCAL_GATEWAY]: i18n.t('protocolHandlerDialog.browserLocalGateway'),
          // [ACTION_OPTIONS.FILES_SCREEN]: i18n.t('protocolHandlerDialog.filesScreen')
          // [ACTION_OPTIONS.EXPLORE_SCREEN]: i18n.t('protocolHandlerDialog.exploreScreen')
        }
      },
      {
        type: 'checkbox',
        name: 'remember',
        defaultValue: 'checked',
        label: i18n.t('protocolHandlerDialog.rememberThisChoice')
      }
    ],
    buttons: [
      i18n.t('continue'),
      i18n.t('cancel')
    ],
    window: {
      width: 500,
      height: 218
    }
  })

  if (button !== 0) {
    return
  }

  const action = input.action || DEFAULT_ACTION

  if (input.remember === 'on') {
    store.set(CONFIG_KEY, false)
    store.set(CONFIG_KEY_ACTION, action)
    ipcMain.emit('configUpdated')
  }

  return action
}

async function getPublicGateway (ctx) {
  if (!ctx.webui) {
    // Best effort. If the Web UI window wasn't created yet, we just return the default
    // gateway.
    return DEFAULT_GATEWAY
  }

  return await ctx.webui
    .webContents
    .executeJavaScript('JSON.parse(localStorage.getItem("ipfsPublicGateway")) || "https://dweb.link"', true)
}

async function getPrivateGateway (ctx) {
  const ipfsd = ctx.getIpfsd ? await ctx.getIpfsd(true) : null
  if (!ipfsd || !ipfsd.api) {
    return DEFAULT_GATEWAY
  }

  let gateway = await ipfsd.api.config.get('Addresses.Gateway')
  if (Array.isArray(gateway)) {
    if (gateway.length >= 1) {
      gateway = gateway[0]
    } else {
      return DEFAULT_GATEWAY
    }
  }

  return toUri(gateway)
}

const checkIfGatewayUrlIsAccessible = async (url) => {
  try {
    const { status } = await fetch(
    `${url}/ipfs/bafkqae2xmvwgg33nmuqhi3zajfiemuzahiwss`
    )
    return status === 200
  } catch (e) {
    return false
  }
}

// Separate test is necessary to see if subdomain mode is possible,
// because some browser+OS combinations won't resolve them:
// https://github.com/ipfs/go-ipfs/issues/7527
const checkIfSubdomainGatewayUrlIsAccessible = async (url) => {
  try {
    url = new URL(url)
    url.hostname = `bafkqae2xmvwgg33nmuqhi3zajfiemuzahiwss.ipfs.${url.hostname}`
    const { status } = await fetch(url.toString())
    return status === 200
  } catch (e) {
    return false
  }
}

function getPathAndProtocol (url) {
  let protocol = null
  let hostname = null
  let path = '/'

  if (url.startsWith('ipfs://')) {
    protocol = 'ipfs'
    hostname = url.slice(7)
  } else if (url.startsWith('ipns://')) {
    protocol = 'ipns'
    hostname = url.slice(7)
  } else if (url.startsWith('dweb:/ipfs/')) {
    protocol = 'ipfs'
    hostname = url.slice(11)
  } else if (url.startsWith('dweb:/ipns/')) {
    protocol = 'ipns'
    hostname = url.slice(11)
  } else {
    return null
  }

  if (hostname.includes('/')) {
    const [first, ...rest] = hostname.split('/')
    hostname = first
    path = '/' + rest.join('/')
  }

  return { protocol, hostname, path }
}

async function getGatewayUrl (ctx, { protocol, hostname, path }) {
  const publicGateway = await getPublicGateway(ctx)
  const privateGateway = await getPrivateGateway(ctx)

  const gw = new URL(privateGateway)
  if (LOCAL_HOSTNAMES.includes(gw.hostname)) {
    gw.hostname = 'localhost'
    const localUrl = gw.toString().replace(/\/+$/, '') // no trailing slashes
    if (await checkIfSubdomainGatewayUrlIsAccessible(localUrl)) {
      if (protocol === 'ipns') {
        hostname = hostname.replaceAll('.', '-')
        gw.hostname = `${hostname}.ipns.localhost`
      } else {
        const cid = CID.parse(hostname)
        gw.hostname = `${cid.toV1().toString()}.ipfs.localhost`
      }

      gw.pathname = path
      return gw.toString().replace(/\/+$/, '')
    }
  }

  if (await checkIfGatewayUrlIsAccessible(privateGateway)) {
    return `${privateGateway}/${protocol}/${hostname}${path}`
  }

  return `${publicGateway}/${protocol}/${hostname}${path}`
}

async function parseUrl (url, ctx) {
  const parsed = getPathAndProtocol(url)
  if (!parsed) {
    return false
  }

  const action = await getAction()

  if (action === ACTION_OPTIONS.OPEN_IN_BROWSER) {
    const url = await getGatewayUrl(ctx, parsed)
    shell.openExternal(url)
    return true
  }

  if (action === ACTION_OPTIONS.OPEN_IN_IPFS_DESKTOP) {
    ctx.launchWebUI(`/${parsed.protocol}/${parsed.hostname}${parsed.path}`, { focus: true })
    return true
  }

  return false
}

async function argvHandler (argv, ctx) {
  let handled = false

  for (const arg of argv) {
    if (await parseUrl(arg, ctx)) {
      handled = true
    }
  }

  return handled
}

module.exports = async function (ctx) {
  // By default, ask. We need to change this to ensure the
  // tray option shows a 'tick'.
  if (store.get(CONFIG_KEY, null) === null) {
    store.set(CONFIG_KEY, true)
    ipcMain.emit('configUpdated')
  }

  createToggler(CONFIG_KEY, () => true)

  // Handle if the app started running now, and a link
  // was sent to be handled.
  argvHandler(process.argv, ctx)

  // Handle URLs in macOS
  app.on('open-url', (event, url) => {
    event.preventDefault()
    parseUrl(url, ctx)
  })
}

module.exports.argvHandler = argvHandler

module.exports.CONFIG_KEY = CONFIG_KEY
