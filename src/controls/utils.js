import multiaddr from 'multiaddr'
import {clipboard} from 'electron'

export function apiAddrToUrl (apiAddr) {
  const parts = multiaddr(apiAddr).nodeAddress()
  const address = parts.address === '127.0.0.1' ? 'localhost' : parts.address

  return `http://${address}:${parts.port}/webui`
}

export function uploadFiles (opts) {
  let {ipfs, logger, fileHistory} = opts

  return (event, files) => {
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
      .catch(e => { logger.error(e.stack) })
  }
}
