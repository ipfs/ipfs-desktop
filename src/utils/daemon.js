import IPFSFactory from 'ipfsd-ctl'
import logger from './logger'
import { showRepoApiFileErrorMessage } from './errors'
import { join } from 'path'
import fs from 'fs-extra'
import { spawnSync } from 'child_process'
import findExecutable from 'ipfsd-ctl/src/utils/find-ipfs-executable'

function repoFsck (path) {
  const exec = findExecutable('go', join(__dirname, '..'))
  spawnSync(exec, ['repo', 'fsck'], {
    env: {
      ...process.env,
      IPFS_PATH: path
    }
  })
}

async function cleanup (path) {
  const apiFile = join(path, 'api')

  if (!await fs.pathExists(apiFile)) {
    return true
  }

  const cfgFile = join(path, 'config')
  const cfg = await fs.readJSON(cfgFile)
  const cfgAddr = cfg.Addresses ? cfg.Addresses.API : ''
  const addr = (await fs.readFile(apiFile)).toString().trim()
  const lockFile = await fs.pathExists(join(path, 'repo.lock'))
  const datastoreLock = await fs.pathExists(join(path, 'datastore/LOCK'))

  if (addr === cfgAddr && (lockFile || datastoreLock)) {
    repoFsck(path)
    return true
  }

  if (showRepoApiFileErrorMessage(path, addr)) {
    repoFsck(path)
    return true
  }

  return false
}

async function configure (ipfsd) {
  const cfgFile = join(ipfsd.repoPath, 'config')
  const cfg = await fs.readJSON(cfgFile)

  let origins = []
  try {
    origins = cfg.API.HTTPHeaders['Access-Control-Allow-Origin']
  } catch (e) {
    logger.warn(e)
  }

  if (!Array.isArray(origins)) {
    origins = []
  }

  if (!origins.includes('webui://-')) origins.push('webui://-')
  if (!origins.includes('https://webui.ipfs.io')) origins.push('https://webui.ipfs.io')

  cfg.API.HTTPHeaders['Access-Control-Allow-Origin'] = origins
  cfg.API.HTTPHeaders['Access-Control-Allow-Methods'] = ['PUT', 'GET', 'POST']

  await fs.writeJSON(cfgFile, cfg)
}

export default async function createDaemon (opts) {
  opts.type = opts.type || 'go'
  opts.path = opts.path || ''
  opts.flags = opts.flags || ['--migrate=true', '--routing=dhtclient']
  opts.keysize = opts.keysize || 4096

  if (opts.type !== 'go') {
    throw new Error(`${opts.type} connection is not supported yet`)
  }

  const factory = IPFSFactory.create({ type: opts.type })

  const ipfsd = await new Promise((resolve, reject) => {
    factory.spawn({
      disposable: false,
      defaultAddrs: true,
      repoPath: opts.path
    }, (e, ipfsd) => {
      if (e) return reject(e)
      if (ipfsd.initialized) {
        return resolve(ipfsd)
      }

      ipfsd.init({
        directory: opts.path,
        keysize: opts.keysize
      }, e => {
        if (e) return reject(e)
        resolve(ipfsd)
      })
    })
  })

  await configure(ipfsd)

  if (!await cleanup(ipfsd.repoPath)) {
    throw new Error('exit')
  }

  if (!ipfsd.started) {
    await new Promise((resolve, reject) => {
      ipfsd.start(opts.flags, err => {
        if (err) {
          return reject(err)
        }

        resolve()
      })
    })
  }

  return ipfsd
}
