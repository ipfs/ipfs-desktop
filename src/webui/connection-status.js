import { ipcRenderer } from 'electron'

export default function () {
  const handler = () => {
    ipcRenderer.send('online-status-changed', navigator.onLine)
  }

  window.addEventListener('online', handler)
  window.addEventListener('offline', handler)
  handler()
}
