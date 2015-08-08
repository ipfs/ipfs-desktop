var init = require('./../init')
var ipfsAPI = require('ipfs-api')('localhost', '5001')

// var ipc = require('ipc')

exports = module.exports = dragDrop

function dragDrop (event, fileArray) {
  if (!init.getIPFS()) {
    // TODO show an error to the user
    return console.error(new Error('Can\'t upload file, IPFS Node is off'))
  }

  console.log('uploading ->', fileArray)

  if (fileArray.length > 1) {
    return console.log('Only supports single files for now')
  }

  ipfsAPI.add(fileArray, function (err, res) {
    if (err || !res) {
      return console.error(err)
    }

    res.forEach(function (file) {
      console.log(file.Hash)
      console.log(file.Name)
    })
  })
}
