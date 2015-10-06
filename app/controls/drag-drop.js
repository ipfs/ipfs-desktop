import API from 'ipfs-api'
import notifier from 'node-notifier'
import {join} from 'path'
import {getIPFS} from './../init'

const ipfsAPI = API('localhost', '5001')

const clipboard = require('clipboard')

const iconPath = join(__dirname, '..', '..', 'node_modules', 'ipfs-logo', 'platform-icons/osx-menu-bar@2x.png')

// TODO persist this to disk
const filesUploaded = []

function notify (title, message) {
  notifier.notify({
    title,
    message,
    icon: iconPath,
    sound: true,
    wait: false
  })
}

function notifyError (message) {
  notifier.notify({
    title: 'Error in file upload',
    message,
    icon: iconPath,
    sound: true,
    wait: false
  })
}

export default function dragDrop (event, files) {
  if (!getIPFS()) {
    notifyError('Can\'t upload file, IPFS Node is offline')
    return
  }
  ipfsAPI.add(files, (err, res) => {
    if (err || !res) {
      notifyError(err || 'Failed to upload files')
    }

    res.forEach(file => {
      const url = `https://ipfs.io/ipfs/${file.Hash}`
      clipboard.writeText(url)
      filesUploaded.push(file)

      notify(
        `Finished uploading ${file.Name}`,
        `${file.Name} was uploaded to ${url}.`
      )
    })
  })
}
