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
