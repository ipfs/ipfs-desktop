import IPFSFactory from 'ipfsd-ctl'
import IPFSApi from 'ipfs-api'
import { join } from 'path'
import fs from 'fs-extra'
import shortid from 'shortid'
import logger from './logger'

export class Connection {
  constructor (opts = {}, id = null) {
    opts.type = opts.type || 'go'
    opts.apiAddress = opts.apiAddress || ''
    opts.path = opts.path || ''
    opts.flags = opts.flags || []
    opts.keysize = opts.keysize || 4096

    if (opts.type === 'api' && !opts.apiAddress) {
      throw new Error('for type \'api\' please set \'apiAddress\'')
    }

    if (opts.type !== 'api' && !opts.path) {
      throw new Error(`for type '${opts.type}' please set 'path'`)
    }

    this.running = false
    this.instance = null
    this.opts = opts
    this.id = id || shortid.generate()
  }

  get justApi () {
    return this.opts.type === 'api'
  }

  get api () {
    return this.justApi ? this.instance : this.instance.api
  }

  async init () {
    if (this.justApi) {
      throw new Error('api connections can\'t be initialized')
    }

    const { path, keysize, type } = this.opts
    const init = !(await fs.pathExists(path)) || fs.readdirSync(path).length === 0

    const factory = IPFSFactory.create({
      type: type,
      exec: type === 'proc' ? require('ipfs') : null
    })

    const error = (e) => {
      logger.warn(e.stack)
      throw e
    }

    factory.spawn({
      init: false,
      start: false,
      disposable: false,
      defaultAddrs: true,
      repoPath: path
    }, (e, ipfsd) => {
      if (e) return error(e)
      if (ipfsd.initialized || !init) return this.save()

      ipfsd.init({
        directory: path,
        keysize: keysize
      }, e => {
        if (e) return error(e)
        this.save()
      })
    })
  }

  async _spawn () {
    if (this.justApi) {
      throw new Error('you can\'t spawn api connections')
    }

    const { type, path } = this.opts
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
        else resolve(ipfsd)
      })
    })
  }

  async start () {
    if (this.running) return

    if (this.justApi) {
      this.instance = IPFSApi(this.opts.apiAddress)
    } else {
      if (!this.instance) {
        this.instance = await this._spawn()
      }

      if (!this.instance.started) {
        await new Promise((resolve, reject) => {
          this.instance.start(this.opts.flags, err => {
            if (err) return reject(err)
            else resolve()
          })
        })
      }
    }

    await this.api.id()
    this.running = true
  }

  async stop () {
    if (!this.running || this.justApi) return

    return new Promise((resolve, reject) => {
      this.instance.stop(err => {
        if (err) return reject(err)
        this.running = false
        resolve()
      })
    })
  }

  toJSON () {
    return {
      type: this.opts.type,
      apiAddress: this.opts.apiAddress,
      flags: this.opts.flags,
      path: this.opts.path
    }
  }
}

export class ConnectionManager {
  constructor () {
    this.conns = {}
    this.current = null
  }

  get api () {
    return this.current ? this.current.api : null
  }

  get running () {
    return !!this.current
  }

  addConnection (conn) {
    this.conns[conn.id] = conn
  }

  async removeConnection (connId) {
    if (this.current && this.current.id === connId) {
      this.current = null
    }

    await this.conns[connId].stop()
    delete this.conns[connId]
  }

  async connectTo (connId) {
    const conn = this.conns[connId]
    await conn.start()
    this.current = conn
  }

  async disconnectAll () {
    for (const id of Object.keys(this.conns)) {
      await this.conns[id].stop()
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
