const { ipcRenderer } = require('electron')

module.exports = function () {
  const handler = () => {
    ipcRenderer.send('online-status-changed', navigator.onLine)
  }

  window.addEventListener('online', handler)
  window.addEventListener('offline', handler)
  handler()
}
