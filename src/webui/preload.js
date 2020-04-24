const toPull = require('stream-to-pull-stream')
const { ipcRenderer, remote } = require('electron')
const readdir = require('recursive-readdir')
const fs = require('fs-extra')
const path = require('path')
const screenshotHook = require('./screenshot')
const connectionHook = require('./connection-status')
const { COUNTLY_KEY, VERSION } = require('../common/consts')

screenshotHook()
connectionHook()

const urlParams = new URLSearchParams(window.location.search)

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
  if (document.hidden) {
    previousHash = window.location.hash
    window.location.hash = '/blank'
  } else {
    window.location.hash = previousHash
  }
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

  selectDirectory: () => {
    return new Promise(resolve => {
      remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
        title: 'Select a directory',
        properties: [
          'openDirectory',
          'createDirectory'
        ]
      }, async (res) => {
        if (!res || res.length === 0) {
          return resolve()
        }

        const files = []

        const prefix = path.dirname(res[0])

        for (const path of await readdir(res[0])) {
          const size = (await fs.stat(path)).size
          files.push({
            path: path.substring(prefix.length, path.length),
            content: toPull.source(fs.createReadStream(path)),
            size: size
          })
        }

        resolve(files)
      })
    })
  },

  removeConsent: (consent) => {
    ipcRenderer.send('countly.removeConsent', consent)
  },

  addConsent: (consent) => {
    ipcRenderer.send('countly.addConsent', consent)
  }
}

// Inject api address
window.localStorage.setItem('ipfsApi', urlParams.get('api'))
