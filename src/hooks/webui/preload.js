const { ipcRenderer } = require('electron')

ipcRenderer.on('updatedPage', (_, url) => {
  window.location.hash = url
})

// This preload script creates the window.ipfs object with
// the apiAddress in the URL.
const urlParams = new URLSearchParams(window.location.search)
const apiAddress = urlParams.get('api')

// Inject api address
window.localStorage.setItem('ipfsApi', apiAddress)
