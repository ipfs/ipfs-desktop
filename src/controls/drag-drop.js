import {logger} from '../config'
import {getIPFS, appendFile} from './../index'
import {clipboard} from 'electron'

// TODO: persist this to disk
const filesUploaded = []

export default function dragDrop (event, files) {
  const ipfs = getIPFS()
  if (!ipfs) {
    // FAILED TO UPLOAD FILES
    return
  }

  ipfs
    .add(files, {w: files.length > 1})
    .then((res) => {
      if (!res) {
        // FAILED TO UPLOAD FILES
        return
      }

      logger.info('Uploading files', {files})

      res.forEach((file) => {
        const url = `https://ipfs.io/ipfs/${file.hash}`
        clipboard.writeText(url)
        filesUploaded.push(file)

        logger.info('Uploaded file %s', file.path)

        appendFile(file.path, file.hash)
      })
    })
    .catch((err) => {
      logger.error(err)
      // FAILED TO UPLOAD FILES
    })
}
