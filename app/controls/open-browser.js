import ipc from 'electron-safe-ipc/host'
import {apiAddrToUrl} from './utils'
import init from './../init'

const shell = require('shell')

function openBrowser (cb) {
  if (init.getIPFS()) {
    init.getIPFS().config.get('Addresses.API', (err, res) => {
      if (err) { // TODO error should be emited to a error panel
        return console.error(err)
      }

      shell.openExternal(apiAddrToUrl(res.Value))
    })
  } else {
    // TODO error should be emited to a error panel
    const err = new Error('Cannot open browser, IPFS daemon not running')
    console.error(err)
  }
}

ipc.on('open-browser', openBrowser)
