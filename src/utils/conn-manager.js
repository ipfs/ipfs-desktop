import IPFSFactory from 'ipfsd-ctl'
import IPFSApi from 'ipfs-api'
import { join } from 'path'
import fs from 'fs-extra'
import logger from './logger'

// TODO: imcomplete. Might change a lot

export default class ConnectionManager {
  constructor () {
    this.opts = {}
    this.instance = null
    this.justApi = false
    this.running = false
  }

  get api () {
    if (!this.running) return null
    return this.justApi ? this.instance : this.instance.api
  }

  async stop () {
    if (!this.running && !this.instance) {
      return
    }

    if (this.justApi) {
      return IPFSApi(this)
    }
  }

  async spawn ({ type, flags, path }) {
    cleanLocks(path)

    const factory = IPFSFactory.create({
      type: type,
      exec: type === 'proc' ? require('ipfs') : null
    })

    return new Promise((resolve, reject) => {
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

        ipfsd.start(flags, err => {
          if (err) return reject(err)
          else resolve(ipfsd)
        })
      })
    })
  }

  async start (opts) {
    if (this.running) await this.disconnect()

    if (!opts && !this.justApi) {
      await new Promise((resolve, reject) => {
        this.instance.start(this.opts.flags, err => {
          if (err) return reject(err)
          else resolve()
        })
      })
    }

    this.opts = opts
    this.justApi = opts.type === 'api'

    if (this.justApi) {
      this.instance = IPFSApi(this)
    } else {
      // TODO: try catch
      this.instance = await this.spawn(opts)
    }

    // TODO: try catch id
    this.running = true
  }
}

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
