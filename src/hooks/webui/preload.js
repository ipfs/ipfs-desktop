const { ipcRenderer, shell } = require('electron')
const { createProxyClient } = require('ipfs-postmsg-proxy')

ipcRenderer.setMaxListeners(100)

window.ipfs = createProxyClient({
  postMessage: (msg) => {
    ipcRenderer.send('ipfs.message', msg)
  },
  addListener: (_, listener) => ipcRenderer.on('ipfs.message', listener),
  removeListener: (_, listener) => ipcRenderer.removeListener('ipfs.message', listener),
  getMessageData: (_, msg) => msg
})

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
