const { ipcRenderer } = require('electron')
const screenshotHook = require('./screenshot')
const connectionHook = require('./connection-status')
const { COUNTLY_KEY, VERSION } = require('../common/consts')

screenshotHook()
connectionHook()

const urlParams = new URLSearchParams(window.location.search)

function checkIfVisible () {
  if (document.hidden) {
    previousHash = window.location.hash
    window.location.hash = '/blank'
  } else {
    window.location.hash = previousHash
  }
}

var originalSetItem = window.localStorage.setItem
window.localStorage.setItem = function () {
  if (arguments[0] === 'i18nextLng') {
    ipcRenderer.send('updateLanguage', arguments[1])
  }

  originalSetItem.apply(this, arguments)
}

let previousHash = null

ipcRenderer.on('updatedPage', (_, url) => {
  previousHash = url
  window.location.hash = url
})

document.addEventListener('visibilitychange', () => {
  checkIfVisible()
})

document.addEventListener('DOMContentReady', () => {
  checkIfVisible()
})

window.ipfsDesktop = {
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
  }
}

// Inject api address
window.localStorage.setItem('ipfsApi', urlParams.get('api'))
