import {ipcMain, BrowserWindow} from 'electron'
import {apiAddrToUrl} from './utils'
import {logger, getIPFS} from './../init'
import config from './../config'

function openConsole () {
  const ipfs = getIPFS()
  if (!ipfs) {
    const err = new Error('Cannot open console, IPFS daemon not running')
    logger.error(err)
    return
  }

  ipfs.config.get('Addresses.API')
    .then((res) => {
      const consoleWindow = new BrowserWindow(config.window)
      consoleWindow.loadURL(apiAddrToUrl(res))
    })
    .catch((err) => {
      return logger.error(err)
    })
}

ipcMain.on('open-console', openConsole)
