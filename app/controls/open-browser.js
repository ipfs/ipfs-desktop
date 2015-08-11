var ipc = require('ipc')
var apiAddrToUrl = require('./utils').apiAddrToUrl
var init = require('./../init')
var open = require('open')

ipc.on('open-browser', openBrowser)

function openBrowser (cb) {
  if (init.getIPFS()) {
    init.getIPFS().config.get('Addresses.API', function (err, res) {
      if (err) { // TODO error should be emited to a error panel
        return console.error(err)
      }

      open(apiAddrToUrl(res.Value))
    })
  } else {
    // TODO error should be emited to a error panel
    var err = new Error('Cannot open browser, IPFS daemon not running')
    console.error(err)
  }
}
