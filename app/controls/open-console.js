import ipc from 'electron-safe-ipc/host'
import {apiAddrToUrl} from './utils'
import {logger, getIPFS} from './../init'
import config from './../config'

const BrowserWindow = require('browser-window')

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
      consoleWindow.loadURL(apiAddrToUrl(res.Value))
    })
    .catch((err) => {
      return logger.error(err)
    })
}

ipc.on('open-console', openConsole)
