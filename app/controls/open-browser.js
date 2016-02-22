import ipc from 'electron-safe-ipc/host'
import {apiAddrToUrl} from './utils'
import {logger, getIPFS} from './../init'

const shell = require('shell')

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

ipc.on('open-browser', openBrowser)
