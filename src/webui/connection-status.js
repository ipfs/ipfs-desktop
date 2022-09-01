const { ipcRenderer } = require('electron')
const ipcMainEvents = require('../common/ipc-main-events')

module.exports = function () {
  const handler = () => {
    ipcRenderer.send(ipcMainEvents.ONLINE_STATUS_CHANGED, navigator.onLine)
  }

  window.addEventListener('online', handler)
  window.addEventListener('offline', handler)
  handler()
}
