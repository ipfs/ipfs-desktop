var init = require('./../init')
var ipfsAPI = require('ipfs-api')('localhost', '5001')
var clipboard = require('clipboard')
var path = require('path')

var ipc = require('ipc')

exports = module.exports = dragDrop

// TODO persist this to disk
var filesUploaded = []

function dragDrop (event, fileArray) {
  if (!init.getIPFS()) {
    // TODO show an error to the user
    return console.error(new Error('Can\'t upload file, IPFS Node is off'))
  }

  if (fileArray.length > 1) {
    return console.log('Only supports single files for now')
  }

  console.log('uploading ->', path.basename(fileArray[0]))

  ipc.emit('uploading', {Name: path.basename(fileArray[0])})

  ipfsAPI.add(fileArray, function (err, res) {
    if (err || !res) {
      return console.error(err)
    }

    res.forEach(function (file) {
      clipboard.writeText('http://gateway.ipfs.io/ipfs/' + file.Hash)
      filesUploaded.push(file)
      ipc.emit('uploaded', file)

      console.log(file.Hash)
      console.log(file.Name)
    })
  })
}
