import multiaddr from 'multiaddr'
import {clipboard} from 'electron'
import isIPFS from 'is-ipfs'

export function apiAddrToUrl (apiAddr) {
  const parts = multiaddr(apiAddr).nodeAddress()
  const address = parts.address === '127.0.0.1' ? 'localhost' : parts.address

  return `http://${address}:${parts.port}/webui`
}

export function uploadFiles (opts) {
  let {ipfs, logger, fileHistory, send} = opts
  let adding = 0

  const sendAdding = () => { send('adding', adding > 0) }
  const inc = () => { adding++; sendAdding() }
  const dec = () => { adding--; sendAdding() }

  return (event, files) => {
    logger.info('Uploading files', {files})
    inc()

    ipfs()
      .add(files, {recursive: true, wrap: true})
      .then((res) => {
        dec()

        res.forEach((file) => {
          const url = `https://ipfs.io/ipfs/${file.hash}`
          clipboard.writeText(url)
          logger.info('Uploaded file', {path: file.path})
          fileHistory.add(file.path, file.hash)
        })
      })
      .catch(e => {
        dec()
        logger.error(e.stack)
      })
  }
}

export function validateIPFS (text) {
  return isIPFS.multihash(text) ||
    isIPFS.cid(text) ||
    isIPFS.ipfsPath(text) ||
    isIPFS.ipfsPath(`/ipfs/${text}`)
}
