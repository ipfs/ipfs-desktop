const { ipcRenderer } = require('electron')
const screenshotHook = require('./screenshot')

screenshotHook()

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

window.ipfsDesktop = {
  onConfigChanged: (listener) => {
    ipcRenderer.on('config.changed', (_, config) => {
      listener(config)
    })

    ipcRenderer.send('config.get')
  },

  toggleSetting: (setting) => {
    ipcRenderer.send('config.toggle', setting)
  }
}

// This preload script creates the window.ipfs object with
// the apiAddress in the URL.
const urlParams = new URLSearchParams(window.location.search)
const apiAddress = urlParams.get('api')

// Inject api address
window.localStorage.setItem('ipfsApi', apiAddress)

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
