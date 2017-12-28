import {dialog, ipcMain} from 'electron'
import {validateIPFS} from '../utils'

function pinHash (opts) {
  const {pinnedFiles, ipfs, send, logger} = opts

  let pinning = 0

  const sendPinning = () => { send('pinning', pinning > 0) }
  const inc = () => { pinning++; sendPinning() }
  const dec = () => { pinning--; sendPinning() }

  return (event, hash, tag) => {
    if (!validateIPFS(hash)) {
      dialog.showErrorBox(
        'Invalid Hash',
        'The hash you provided is invalid.'
      )
      return
    }

    inc()
    logger.info(`Pinning ${hash}`)

    ipfs().pin.add(hash)
      .then(() => {
        dec()
        logger.info(`${hash} pinned`)
        pinnedFiles.add(hash, tag)
      })
      .catch(e => {
        dec()
        logger.error(e.stack)
        dialog.showErrorBox(
          'Error while pinning',
          'Some error happened while pinning the hash. Please check the logs.'
        )
      })
  }
}

function unpinHash (opts) {
  const {pinnedFiles, ipfs, logger} = opts

  return (event, hash) => {
    logger.info(`Unpinning ${hash}`)

    ipfs().pin.rm(hash)
      .then(() => {
        logger.info(`${hash} unpinned`)
        pinnedFiles.remove(hash)
      })
      .catch(e => { logger.error(e.stack) })
  }
}

export default function (opts) {
  const {pinnedFiles, send} = opts

  const handler = () => {
    send('pinned', pinnedFiles.toObject())
  }

  // Set event handlers.
  ipcMain.on('tag-hash', (event, hash, tag) => {
    pinnedFiles.add(hash, tag)
  })

  ipcMain.on('request-pinned', handler)
  pinnedFiles.on('change', handler)
  ipcMain.on('pin-hash', pinHash(opts))
  ipcMain.on('unpin-hash', unpinHash(opts))
}
