// @ts-check
const { ipcRenderer, contextBridge } = require('electron')
const screenshotHook = require('./screenshot')
const connectionHook = require('./connection-status')
const { COUNTLY_KEY, VERSION } = require('../common/consts')
const ipcMainEvents = require('../common/ipc-main-events')

screenshotHook()
connectionHook()

const urlParams = new URLSearchParams(window.location.search)

let previousHash = null

// While the window is not visible, navigate the HashRouter to `#/blank` so the
// React app unmounts. This avoids re-rendering the bandwidth graph on Status
// and the peer list on Peers while the user cannot see them. Restore the
// previous route when visible again.
//
// Two signal sources, both calling the idempotent updater:
//
//   1. WEBUI_VISIBILITY_CHANGED IPC from the main process: deterministic when
//      the app calls `window.show()` / `window.hide()` programmatically (e.g.
//      tray-driven navigation), where Chromium's `visibilitychange` is not
//      reliably observed in time and the renderer would miss the un-blank.
//
//   2. `document.visibilitychange`: covers cases the main process never sees,
//      such as full occlusion by another window, macOS app-hide (Cmd+H) and
//      Mission Control / Spaces. Without this, those screens keep
//      re-rendering while the user is not looking at them.
function updateVisibility (isVisible) {
  if (!isVisible) {
    if (window.location.hash === '#/blank') return // skip, already blank
    previousHash = window.location.hash
    window.location.hash = '/blank'
    return
  }

  if (!previousHash || window.location.hash !== '#/blank') return // skip
  window.location.hash = previousHash
}

ipcRenderer.on(ipcMainEvents.WEBUI_VISIBILITY_CHANGED, (_event, isVisible) => {
  updateVisibility(Boolean(isVisible))
})

document.addEventListener('visibilitychange', () => {
  updateVisibility(!document.hidden)
})

// track hash changes, so updateVisibility always has the right previousHash
document.addEventListener('hashchange', () => {
  if (window.location.hash === '#/blank') return // skip
  previousHash = window.location.hash
})

contextBridge.exposeInMainWorld('ipfsDesktop', {
  countlyAppKey: COUNTLY_KEY,

  countlyDeviceId: urlParams.get('deviceId'),

  countlyActions: [
    'ADD_VIA_DESKTOP',
    'DAEMON_START',
    'DAEMON_STOP',
    'DOWNLOAD_HASH',
    'MOVE_REPOSITORY',
    'SCREENSHOT_TAKEN'
  ],

  version: VERSION,

  /**
   *
   * @param {import('countly-sdk-nodejs').ConsentFeatures} consent
   */
  removeConsent: (consent) => {
    ipcRenderer.send(ipcMainEvents.COUNTLY_REMOVE_CONSENT, consent)
  },

  /**
   *
   * @param {import('countly-sdk-nodejs').ConsentFeatures} consent
   */
  addConsent: (consent) => {
    ipcRenderer.send(ipcMainEvents.COUNTLY_ADD_CONSENT, consent)
  },

  updateLanguage: (language) => {
    ipcRenderer.send(ipcMainEvents.LANG_UPDATED, language)
  }
})

// Inject api address
const apiAddress = urlParams.get('api')
if (apiAddress != null) {
  window.localStorage.setItem('ipfsApi', apiAddress)
}
