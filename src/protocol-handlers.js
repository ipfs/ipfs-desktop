const { app, shell } = require('electron')
const toUri = require('multiaddr-to-uri')
const i18n = require('i18next')
const store = require('./common/store')
const { showPrompt } = require('./dialogs')

const CONFIG_KEY = 'askWhenOpeningIpfsURIs'
const CONFIG_KEY_ACTION = 'openIpfsURIsAction'

const ACTION_OPTIONS = {
  BROWSER_PUBLIC_GATEWAY: 'browserPublicGateway',
  BROWSER_LOCAL_GATEWAY: 'browserLocalGateway',
  FILES_SCREEN: 'filesScreen',
  EXPLORE_SCREEN: 'exploreScreen'
}

const DEFAULT_ACTION = ACTION_OPTIONS.BROWSER_PUBLIC_GATEWAY

async function getAction () {
  const ask = store.get(CONFIG_KEY, true)
  if (!ask) {
    return store.get(CONFIG_KEY_ACTION, DEFAULT_ACTION)
  }

  const { button, input } = await showPrompt({
    title: 'Opening IPFS URIs',
    message: 'How would you like IPFS Desktop to open IPFS URIs?',
    inputs: [
      {
        type: 'radio',
        name: 'action',
        defaultValue: DEFAULT_ACTION,
        labels: {
          [ACTION_OPTIONS.BROWSER_PUBLIC_GATEWAY]: 'In my default browser using a public gateway',
          [ACTION_OPTIONS.BROWSER_LOCAL_GATEWAY]: 'In my default browser using a local gateway',
          [ACTION_OPTIONS.FILES_SCREEN]: 'In the Files screen',
          [ACTION_OPTIONS.EXPLORE_SCREEN]: 'In the Explore screen'
        }
      },
      {
        type: 'checkbox',
        name: 'remember',
        defaultValue: 'checked',
        label: 'Remember this choice for all IPFS URIs'
      }
    ],
    buttons: [
      i18n.t('continue'),
      i18n.t('cancel')
    ],
    window: {
      width: 500,
      height: 240
    }
  })

  if (button !== 0) {
    return
  }

  const action = input.action || DEFAULT_ACTION

  if (input.remember === 'on') {
    store.set(CONFIG_KEY, false)
    store.set(CONFIG_KEY_ACTION, action)
  }

  return action
}

function openLink (protocol, part, base) {
  shell.openExternal(`${base}/${protocol}/${part}`)
}

function parseAddr (addr) {
  return toUri(addr.toString().includes('/http') ? addr : addr.encapsulate('/http'))
}

async function parseUrl (url, ctx) {
  let protocol = ''
  let part = ''

  if (url.startsWith('ipfs://')) {
    protocol = 'ipfs'
    part = url.slice(7)
  } else if (url.startsWith('ipns://')) {
    protocol = 'ipns'
    part = url.slice(7)
  } else if (url.startsWith('dweb:/ipfs/')) {
    protocol = 'ipfs'
    part = url.slice(11)
  } else if (url.startsWith('dweb:/ipns/')) {
    protocol = 'ipns'
    part = url.slice(11)
  } else {
    return false
  }

  const action = store.get(CONFIG_KEY_ACTION, DEFAULT_ACTION)
  let base = 'https://dweb.link'

  switch (action) {
    case ACTION_OPTIONS.BROWSER_PUBLIC_GATEWAY:
      openLink(protocol, part, base)
      break
    case ACTION_OPTIONS.BROWSER_LOCAL_GATEWAY:
      const ipfsd = ctx.getIpfsd ? await ctx.getIpfsd(true) : null

      // Best effort. Defaults to public gateway if not available.
      if (ipfsd && ipfsd.gatewayAddr) {
        base = parseAddr(ipfsd.gatewayAddr)
      }

      openLink(protocol, part, base)
      break
    case ACTION_OPTIONS.FILES_SCREEN:
      ctx.launchWebUI(`/${protocol}/${part}`, { focus: true })
      break
    case ACTION_OPTIONS.EXPLORE_SCREEN:
      ctx.launchWebUI(`/explore/${protocol}/${part}`, { focus: true })
      break
    default:
      return false
  }

  openLink(protocol, part, base)
  return true
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

module.exports = function (ctx) {
  // By default, ask. We need to change this to ensure the
  // tray option shows a 'tick'.
  if (store.get(CONFIG_KEY, null) === null) {
    store.set(CONFIG_KEY, true)
  }

  setTimeout(async () => {
    const action = await getAction()
    console.log(action)
  }, 5000)

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
