import path from 'path'
import ipc from 'electron-safe-ipc/host'
import API from 'ipfs-api'
const ipfsAPI = API('localhost', '5001')

import init from './../init'

const shell = require('shell')
const clipboard = require('clipboard')

// TODO persist this to disk
const filesUploaded = []

export default function dragDrop (event, fileArray) {
  if (!init.getIPFS()) {
    // TODO show an error to the user
    return console.error(new Error('Can\'t upload file, IPFS Node is off'))
  }

  fileArray.forEach(file => {
    console.log('uploading ->', path.basename(file))
    ipc.send('uploading', {Name: path.basename(file)})
  })

  ipfsAPI.add(fileArray, (err, res) => {
    if (err || !res) {
      return console.error(err)
    }

    res.forEach((file) => {
      clipboard.writeText('http://gateway.ipfs.io/ipfs/' + file.Hash)
      filesUploaded.push(file)
      ipc.emit('uploaded', file)

      shell.beep()

      console.log(file.Hash)
      console.log(file.Name)
    })
  })
}
