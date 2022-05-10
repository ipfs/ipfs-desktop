const { app, shell, ipcMain } = require('electron')
const i18n = require('i18next')
const createToggler = require('../utils/create-toggler')
const store = require('../common/store')
const { showPrompt } = require('../dialogs')
const setupI18n = require('../i18n')
const { parseUrl, getGatewayUrl } = require('./urls')

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

async function handleUrl (url, ctx) {
  const parsed = parseUrl(url)
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
    if (await handleUrl(arg, ctx)) {
      handled = true
    }
  }

  return handled
}

module.exports = async function (ctx) {
  await app.whenReady()
  await setupI18n(ctx) // Ensure i18n is ready for the dialog.

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
