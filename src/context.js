// @ts-check
const setupI18n = require('./i18n')
const setupDaemon = require('./daemon')
const setupWebUI = require('./webui')
const setupAppMenu = require('./app-menu')
const setupAutoUpdater = require('./auto-updater')
const setupTray = require('./tray')
const setupAnalytics = require('./analytics')
const handleError = require('./handleError')

/**
 * @typedef createDaemonResponse
 * @type {ReturnType<import('./daemon/daemon')>}
 */
/**
 * @typedef IpfsdController
 * @type {(Awaited<createDaemonResponse>)['ipfsd']}
 */
/**
 * @typedef AppContext
 * @property {null|string} countlyDeviceId
 * @property {null|((optional: boolean) => Promise<IpfsdController>)} getIpfsd
 * @property {null|((path: string, options?: { focus?: boolean, forceRefresh?: boolean }) => Promise<void>)} launchWebUI
 * @property {null|(() => Promise<void>)} manualCheckForUpdates
 * @property {() => Promise<any>} restartIpfs
 * @property {() => Promise<any>} startIpfs
 * @property {() => Promise<any>} stopIpfs
 * @property {null|import('electron').Tray} tray
 * @property {import('electron').BrowserWindow} webui
 */

/**
 * @type {AppContext}
 */
const context = {
  countlyDeviceId: null,
  getIpfsd: null,
  launchWebUI: null,
  manualCheckForUpdates: async () => {},
  startIpfs: async () => {},
  stopIpfs: async () => {},
  restartIpfs: async () => {},
  tray: null,
  webui: null

}

/**
 * @type {Promise<AppContext>}
 */
const ctx = (async () => {
  try {
    await setupAnalytics(context) // ctx.countlyDeviceId
    await setupI18n()
    await setupAppMenu()

    await setupWebUI(context) // ctx.webui, launchWebUI
    await setupAutoUpdater(context) // ctx.manualCheckForUpdates
    await setupTray(context) // ctx.tray
    await setupDaemon(context) // ctx.getIpfsd, startIpfs, stopIpfs, restartIpfs
  } catch (err) {
    handleError(err)
  }

  return context
})()

/**
 * @type {Promise<AppContext>}
 */
module.exports = ctx
