var init = require('./../init')
var ipfsAPI = require('node-ipfs-api')

exports = module.exports = dragDrop

function dragDrop (fileArray) {
  if (!init.IPFS) {
    return console.error(new Error('Can\'t upload file, IPFS Node is off'))
  }

  console.log('uploading ->', fileArray)
}
