import {BrowserWindow} from 'electron'
import config from './../config'

export default function openSettings () {
  const settingsWindow = new BrowserWindow(config.window)

  settingsWindow.loadURL(config.urls.settings)

  settingsWindow.webContents.on('did-finish-load', () => {})
}
