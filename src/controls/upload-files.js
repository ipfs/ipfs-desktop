import {logger, fileHistory} from '../config'
import {clipboard} from 'electron'

export default function uploadFiles (ipfs, event, files) {
  ipfs()
    .add(files, {recursive: true, w: files.length > 1})
    .then((res) => {
      logger.info('Uploading files', {files})

      res.forEach((file) => {
        const url = `https://ipfs.io/ipfs/${file.hash}`
        clipboard.writeText(url)
        logger.info('Uploaded file', {path: file.path})
        fileHistory.add(file.path, file.hash)
      })
    })
    .catch(logger.error)
}
