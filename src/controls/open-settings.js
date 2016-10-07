import {ipcMain, BrowserWindow} from 'electron'
import config from './../config'

function openSettings () {
  const settingsWindow = new BrowserWindow(config.window)

  settingsWindow.loadURL(config.urls.settings)

  settingsWindow.webContents.on('did-finish-load', () => {})
}

ipcMain.on('open-settings', openSettings)
