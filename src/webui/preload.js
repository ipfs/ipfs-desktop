const { ipcRenderer, contextBridge } = require('electron')
const screenshotHook = require('./screenshot')
const connectionHook = require('./connection-status')
const { COUNTLY_KEY, VERSION } = require('../common/consts')

screenshotHook()
connectionHook()

const urlParams = new URLSearchParams(window.location.search)

let previousHash = null

function checkIfVisible () {
  if (document.hidden) {
    if (window.location.hash === '#/blank') return // skip, already blank
    previousHash = window.location.hash
    window.location.hash = '/blank'
  } else {
    if (previousHash === '#/blank') return // skip
    window.location.hash = previousHash
  }
}

document.addEventListener('visibilitychange', () => {
  checkIfVisible()
})

document.addEventListener('DOMContentReady', () => {
  checkIfVisible()
})

// track hash changes, so checkIfVisible always has the right previousHash
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

  removeConsent: (consent) => {
    ipcRenderer.send('countly.removeConsent', consent)
  },

  addConsent: (consent) => {
    ipcRenderer.send('countly.addConsent', consent)
  },

  updateLanguage: (language) => {
    ipcRenderer.send('updateLanguage', language)
  }
})

// Inject api address
window.localStorage.setItem('ipfsApi', urlParams.get('api'))
