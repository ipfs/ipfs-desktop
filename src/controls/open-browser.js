import {ipcMain, shell} from 'electron'
import {apiAddrToUrl} from './utils'
import {logger} from '../config'
import {getIPFS} from './../index'

function openBrowser (cb) {
  const ipfs = getIPFS()
  if (!ipfs) {
    const err = new Error('Cannot open browser, IPFS daemon not running')
    logger.error(err)
    return
  }

  ipfs.config.get('Addresses.API')
    .then((res) => {
      shell.openExternal(apiAddrToUrl(res))
    })
    .catch((err) => {
      return logger.error(err)
    })
}

ipcMain.on('open-browser', openBrowser)
