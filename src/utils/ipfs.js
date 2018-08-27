import IPFSFactory from 'ipfsd-ctl'
import IPFSApi from 'ipfs-api'
import { join } from 'path'
import fs from 'fs-extra'
import logger from './logger'

function cleanLocks (path) {
  // This fixes a bug on Windows, where the daemon seems
  // not to be exiting correctly, hence the file is not
  // removed.
  logger.info('Cleaning repo.lock and api files')
  const lockPath = join(path, 'repo.lock')
  const apiPath = join(path, 'api')

  if (fs.existsSync(lockPath)) {
    try {
      fs.unlinkSync(lockPath)
    } catch (_) {
      logger.warn('Could not remove repo.lock. Daemon might be running')
    }
  }

  if (fs.existsSync(apiPath)) {
    try {
      fs.unlinkSync(apiPath)
    } catch (_) {
      logger.warn('Could not remove api. Daemon might be running')
    }
  }
}

export default async function ({ type, apiAddress, path, flags, keysize, init }) {
  let factOpts = { type: type }

  if (type === 'proc') {
    factOpts.exec = require('ipfs')
  }

  if (type === 'api') {
    return IPFSApi(apiAddress)
  }

  cleanLocks(path)

  const factory = IPFSFactory.create(factOpts)

  return new Promise((resolve, reject) => {
    const start = (ipfsd) => ipfsd.start(flags, (err, api) => {
      if (err) return reject(err)
      else resolve(ipfsd)
    })

    factory.spawn({
      init: false,
      start: false,
      disposable: false,
      defaultAddrs: true,
      repoPath: path
    }, (err, ipfsd) => {
      if (err) return reject(err)

      if (ipfsd.started) {
        return resolve(ipfsd)
      }

      if (!ipfsd.initialized && init) {
        return ipfsd.init({
          directory: path,
          keysize: keysize
        }, err => {
          if (err) return reject(err)
          else start(ipfsd)
        })
      }

      start(ipfsd)
    })
  })
}
