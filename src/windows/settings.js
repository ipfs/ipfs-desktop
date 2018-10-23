import { logo, store } from '../utils'
import { BrowserWindow, ipcMain } from 'electron'

export default async function (opts) {
  return new Promise(resolve => {
    const window = new BrowserWindow({
      icon: logo('ice'),
      show: false
    })

    window.loadURL(`file://${__dirname}/settings/index.html`)

    opts.settingsWindow = {
      window: window,
      send: (type, ...args) => {
        if (window && window.webContents) {
          window.webContents.send(type, ...args)
        }
      }
    }

    ipcMain.on('config.get', () => {
      opts.settingsWindow.send('config.changed', store.store)
    })

    ipcMain.on('settings.openWindow', () => {
      window.show()
      window.focus()
    })

    window.on('close', event => {
      event.preventDefault()
      window.hide()
    })

    window.once('ready-to-show', () => {
      resolve()
    })
  })
}
