const { COUNTLY_KEY, VERSION } = require('../common/consts')
const toPull = require('stream-to-pull-stream')
const { ipcRenderer, remote } = require('electron')
const readdir = require('recursive-readdir')
const fs = require('fs-extra')
const path = require('path')
const screenshotHook = require('./screenshot')
const connectionHook = require('./connection-status')

screenshotHook()
connectionHook()

var originalSetItem = window.localStorage.setItem
window.localStorage.setItem = function () {
  if (arguments[0] === 'i18nextLng') {
    ipcRenderer.send('updateLanguage', arguments[1])
  }

  originalSetItem.apply(this, arguments)
}

ipcRenderer.on('updatedPage', (_, url) => {
  window.location.hash = url
})

const urlParams = new URLSearchParams(window.location.search)

window.ipfsDesktop = {
  countlyAppKey: COUNTLY_KEY,

  countlyDeviceId: urlParams.get('deviceId'),

  version: VERSION,

  onConfigChanged: (listener) => {
    ipcRenderer.on('config.changed', (_, config) => {
      listener(config)
    })

    ipcRenderer.send('config.get')
  },

  toggleSetting: (setting) => {
    ipcRenderer.send('config.toggle', setting)
  },

  configHasChanged: () => {
    ipcRenderer.send('ipfsConfigChanged')
  },

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

// Allow webui window to be dragged on mac
document.addEventListener('DOMContentLoaded', function (event) {
  var windowTopBar = document.createElement('div')
  windowTopBar.style.width = '100%'
  windowTopBar.style.height = '32px'
  windowTopBar.style.position = 'absolute'
  windowTopBar.style.top = windowTopBar.style.left = 0
  windowTopBar.style.webkitAppRegion = 'drag'
  document.body.appendChild(windowTopBar)
})
