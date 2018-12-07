import { createProxyServer } from 'ipfs-postmsg-proxy'
import { ipcMain } from 'electron'

export default function (getIpfs, getWindow) {
  ipcMain.setMaxListeners(100)

  createProxyServer(getIpfs, {
    postMessage: (msg) => {
      const window = getWindow()
      if (window) {
        window.webContents.send('ipfs.message', msg)
      }
    },
    addListener: (_, listener) => ipcMain.on('ipfs.message', listener),
    removeListener: (_, listener) => ipcMain.removeListener('ipfs.message', listener),
    getMessageData: (_, msg) => msg
  })
}
