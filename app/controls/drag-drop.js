import path from 'path'
import API from 'ipfs-api'
const ipfsAPI = API('localhost', '5001')

import {getIPFS} from './../init'

const shell = require('shell')
const clipboard = require('clipboard')

// TODO persist this to disk
const filesUploaded = []

export default function dragDrop (ipc, event, files) {
  if (!getIPFS()) {
    // TODO show an error to the user
    return console.error(new Error('Can\'t upload file, IPFS Node is off'))
  }

  files.forEach(file => {
    console.log('uploading ->', path.basename(file))
    ipc.send('uploading', {Name: path.basename(file)})
  })

  ipfsAPI.add(files, (err, res) => {
    if (err || !res) {
      return console.error(err)
    }

    res.forEach(file => {
      clipboard.writeText('http://gateway.ipfs.io/ipfs/' + file.Hash)
      filesUploaded.push(file)
      ipc.send('uploaded', file)

      shell.beep()

      console.log(file.Hash)
      console.log(file.Name)
    })
  })
}
