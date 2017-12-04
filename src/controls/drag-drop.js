import {logger} from '../config'
import {appendFile} from './../index'
import {clipboard} from 'electron'

export function dragDrop (ipfs, event, files) {
  ipfs()
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
        logger.info('Uploaded file', {path: file.path})
        appendFile(file.path, file.hash)
      })
    })
    .catch((err) => {
      logger.error(err)
      // FAILED TO UPLOAD FILES
    })
}

export function uploadFolders (ipfs, event, files) {
  ipfs()
    .add(files, {recursive: true, w: files.length > 1})
    .then((res) => {
      if (!res) {
        // FAILED TO UPLOAD FILES
        return
      }

      logger.info('Uploading files', {files})

      res.forEach((file) => {
        const url = `https://ipfs.io/ipfs/${file.hash}`
        clipboard.writeText(url)
        logger.info('Uploaded file', {path: file.path})
        appendFile(file.path, file.hash)
      })
    })
    .catch((err) => {
      logger.error(err)
      // FAILED TO UPLOAD FILES
    })
}

