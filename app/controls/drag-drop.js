var init = require('./../init')
var ipfsAPI = require('ipfs-api')
var ipc = require('ipc')

exports = module.exports = dragDrop

function dragDrop (event, fileArray) {
  console.log(init)

  if (!init.getIPFS()) {
    return console.error(new Error('Can\'t upload file, IPFS Node is off'))
    // TODO show an error to the user
  }

  console.log('uploading ->', fileArray)
}
