import notifier from 'node-notifier'
import {join} from 'path'
import {getIPFS, logger} from './../init'
import clipboard from 'clipboard'

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
  const ipfs = getIPFS()
  if (!ipfs) {
    notifyError('Can\'t upload file, IPFS Node is offline')
    return
  }

  ipfs.add(files, {w: files.length > 1})
    .then((res) => {
      if (!res) {
        notifyError('Failed to upload files')
        return
      }

      logger.info('Uploading files', {files})

      res.forEach((file) => {
        const url = `https://ipfs.io/ipfs/${file.Hash}`
        clipboard.writeText(url)
        filesUploaded.push(file)

        logger.info('Uploaded file %s', file.Name)

        notify(
          `Finished uploading ${file.Name}`,
          `${file.Name} was uploaded to ${url}.`
        )
      })
    })
    .catch((err) => {
      logger.error(err)
      notifyError(err.message)
    })
}
