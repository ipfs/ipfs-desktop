//@ts-check
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
 * @property {string|null} countlyDeviceId
 * @property {null|((optional: boolean) => Promise<IpfsdController>)} getIpfsd
 * @property {(path: string, options: { focus: boolean, forceRefresh: boolean }) => Promise<void>} launchWebUI
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
    webui: null,

}

module.exports = context
