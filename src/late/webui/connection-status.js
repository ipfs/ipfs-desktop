const { ipcRenderer } = require('electron')

module.exports = function () {
  let prevStatus = navigator.onLine

  const handler = () => {
    if (!prevStatus && navigator.onLine) {
      ipcRenderer.send('restartIpfs')
    }

    prevStatus = navigator.onLine
  }

  window.addEventListener('online', handler)
  window.addEventListener('offline', handler)
}
