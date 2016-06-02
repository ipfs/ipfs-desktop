import {ipcMain, shell} from 'electron'
import {apiAddrToUrl} from './utils'
import {logger, getIPFS} from './../init'

function openBrowser (cb) {
  const ipfs = getIPFS()
  if (!ipfs) {
    const err = new Error('Cannot open browser, IPFS daemon not running')
    logger.error(err)
    return
  }

  ipfs.config.get('Addresses.API')
    .then((res) => {
      shell.openExternal(apiAddrToUrl(res.Value))
    })
    .catch((err) => {
      return logger.error(err)
    })
}

ipcMain.on('open-browser', openBrowser)
