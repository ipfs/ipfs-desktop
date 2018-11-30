const { ipcRenderer, shell } = require('electron')

document.addEventListener('click', function (event) {
  if (event.target.tagName === 'A' && event.target.href.startsWith('http')) {
    event.preventDefault()
    shell.openExternal(event.target.href)
  }
})

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
