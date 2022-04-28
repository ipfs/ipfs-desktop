// @ts-check

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
 * @type {ProxyHandler<AppContext>}
 * @function
 * @param {AppContext} target
 * @param {string|symbol} property
 * @param {any} value
 * @param {any} receiver
 *
 * This is only temporary, in order to catch any unnecessary setting of properties, and also to document the order of them.
 */
const contextSetterProxyHandler = {
    set (target, property, value, receiver) {
        console.log(`property: `, property);

        return true
    }
}

module.exports = new Proxy(context, contextSetterProxyHandler)
