const { ipcRenderer } = require('electron')
const ipcMainEvents = require('../common/ipc-main-events.js')

const defaultExport = function () {
  const handler = () => {
    ipcRenderer.send(ipcMainEvents.ONLINE_STATUS_CHANGED, navigator.onLine)
  }

  window.addEventListener('online', handler)
  window.addEventListener('offline', handler)
  handler()
}

module.exports = defaultExport
