import IPFSFactory from 'ipfsd-ctl'
import EventEmitter from 'events'
import { join } from 'path'
import fs from 'fs-extra'
import logger from './logger'

export default class Connection extends EventEmitter {
  constructor (opts = {}) {
    super()

    opts.type = opts.type || 'go'
    opts.path = opts.path || ''
    opts.flags = opts.flags || []
    opts.keysize = opts.keysize || 4096

    if (opts.type !== 'go') {
      throw new Error(`${opts.type} connection is not supported yet`)
    }

    this.running = false
    this.instance = null
    this.opts = opts
  }

  get api () {
    return this.instance ? this.instance.api : null
  }

  async apiAddress () {
    if (!this.api) return null
    return this.api.config.get('Addresses.API')
  }

  async gatewayAddress () {
    if (!this.api) return null
    return this.api.config.get('Addresses.Gateway')
  }

  async init () {
    const { path, keysize, type } = this.opts
    const init = !(await fs.pathExists(path)) || fs.readdirSync(path).length === 0

    if (!init) {
      await cleanLocks(path)
    }

    const factory = IPFSFactory.create({ type })

    await new Promise((resolve, reject) => {
      factory.spawn({
        init: false,
        start: false,
        disposable: false,
        defaultAddrs: true,
        repoPath: path
      }, (e, ipfsd) => {
        if (e) return reject(e)
        if (ipfsd.initialized || !init) {
          this.instance = ipfsd
          resolve()
        }

        ipfsd.init({
          directory: path,
          keysize: keysize
        }, e => {
          if (e) return reject(e)
          this.instance = ipfsd
          resolve()
        })
      })
    })
  }

  async start (init = true) {
    if (this.running) {
      logger.info('IPFS %o already running', this.toJSON())
      return
    }

    logger.info('Starting IPFS %o', this.toJSON())

    if (!this.instance.started) {
      await new Promise((resolve, reject) => {
        this.instance.start(this.opts.flags, err => {
          if (err && err.stack.includes('init') && init) {
            this.init()
              .then(() => this.start(false))
              .then(resolve)
              .catch(reject)

            return
          } else if (err) {
            return reject(err)
          }

          resolve()
        })
      })
    }

    await this.api.id()
    this.running = true
    logger.info('Started IPFS')
    this.emit('started')
  }

  async stop () {
    if (!this.running) {
      logger.info('IPFS %o already stopped', this.toJSON())
      return
    }

    logger.info('Stopping IPFS %o', this.toJSON())
    return new Promise((resolve, reject) => {
      this.instance.stop(err => {
        if (err) return reject(err)
        this.running = false
        logger.info('Stopped IPFS %o', this.toJSON())
        this.emit('stopped')
        resolve()
      })
    })
  }

  toJSON () {
    return {
      type: this.opts.type,
      flags: this.opts.flags,
      path: this.opts.path
    }
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
