var init = require('./../init')
var ipfsAPI = require('ipfs-api')('localhost', '5001')
var clipboard = require('clipboard')
var path = require('path')
var shell = require('shell')

var ipc = require('ipc')

exports = module.exports = dragDrop

// TODO persist this to disk
var filesUploaded = []

function dragDrop (event, fileArray) {
  if (!init.getIPFS()) {
    // TODO show an error to the user
    return console.error(new Error('Can\'t upload file, IPFS Node is off'))
  }

  fileArray.forEach(function (file) {
    console.log('uploading ->', path.basename(file))
    ipc.emit('uploading', {Name: path.basename(file)})
  })

  ipfsAPI.add(fileArray, function (err, res) {
    if (err || !res) {
      return console.error(err)
    }

    res.forEach(function (file) {
      clipboard.writeText('http://gateway.ipfs.io/ipfs/' + file.Hash)
      filesUploaded.push(file)
      ipc.emit('uploaded', file)

      shell.beep()

      console.log(file.Hash)
      console.log(file.Name)
    })
  })
}
