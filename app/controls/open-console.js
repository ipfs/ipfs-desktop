import ipc from 'electron-safe-ipc/host'
import {apiAddrToUrl} from './utils'
import {getIPFS} from './../init'
import config from './../config'

const BrowserWindow = require('browser-window')

function openConsole () {
  if (getIPFS()) {
    getIPFS().config.get('Addresses.API', (err, res) => {
      if (err) { // TODO() error should be emited to a error panel
        return console.error(err)
      }

      const consoleWindow = new BrowserWindow(config.window)
      consoleWindow.loadUrl(apiAddrToUrl(res.Value))
    })
  } else {
    // TODO() error should be emited to a error panel
    const err = new Error('Cannot open console, IPFS daemon not running')
    console.error(err)
  }
}

ipc.on('open-console', openConsole)
