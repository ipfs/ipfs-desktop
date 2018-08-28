import {dialog, ipcMain} from 'electron'
import {validateIPFS} from '../utils'
import { logger } from '../../utils'
import bl from 'bl'

const PATH = '/.pinset'

var pins = {}

function collect (stream) {
  return new Promise((resolve, reject) => {
    stream.pipe(bl((err, buf) => {
      if (err) return reject(err)
      resolve(buf)
    }))
  })
}

function makePinset (opts) {
  const {ipfs} = opts

  return new Promise((resolve, reject) => {
    ipfs().files.stat(PATH)
      .then(resolve)
      .catch(() => {
        ipfs().files.write(PATH, Buffer.from('{}'), {create: true})
          .then(resolve)
          .catch(reject)
      })
  })
}

function writePinset (opts) {
  const {ipfs, send} = opts

  return new Promise((resolve, reject) => {
    const write = JSON.stringify(pins)
    ipfs().files.rm(PATH, { recursive: true })
      .then(() => ipfs().files.write(PATH, Buffer.from(write), {create: true}))
      .then(() => {
        send('pinned', pins)
        send('files-updated')
        resolve()
      })
      .catch(reject)
  })
}

function pinset (opts) {
  const {ipfs} = opts

  return () => {
    pins = {}

    ipfs().pin.ls()
      .then((pinset) => {
        pinset.forEach((pin) => {
          if (pin.type === 'indirect') {
            return
          }

          pins[pin.hash] = ''
        })

        return makePinset(opts)
      })
      .then(() => ipfs().files.read(PATH))
      .then((res) => collect(res))
      .then((buf) => JSON.parse(buf.toString()))
      .then((res) => {
        for (const hash in res) {
          if (hash in pins) {
            pins[hash] = res[hash]
          }
        }

        return writePinset(opts)
      })
      .catch(error => logger.error(error.stack))
  }
}

function pinHash (opts) {
  const {ipfs, send} = opts

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
        pins[hash] = tag
        return writePinset(opts)
      })
      .catch(e => {
        dec()
        logger.error(e.stack)
      })
  }
}

function unpinHash (opts) {
  const {ipfs} = opts

  return (_, hash) => {
    logger.info(`Unpinning ${hash}`)

    ipfs().pin.rm(hash)
      .then(() => {
        logger.info(`${hash} unpinned`)
        delete pins[hash]
        return writePinset(opts)
      })
      .catch(e => { logger.error(e.stack) })
  }
}

function tagHash (opts) {
  return (_, hash, tag) => {
    pins[hash] = tag
    writePinset(opts).catch(e => { logger.error(e.stack) })
  }
}

export default function (opts) {
  ipcMain.on('request-pinned', pinset(opts))
  ipcMain.on('tag-hash', tagHash(opts))
  ipcMain.on('pin-hash', pinHash(opts))
  ipcMain.on('unpin-hash', unpinHash(opts))
}
