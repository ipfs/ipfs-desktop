import IPFSFactory from 'ipfsd-ctl'
import { showRepoApiFileErrorMessage } from './errors'
import { join } from 'path'
import fs from 'fs-extra'
import { session } from 'electron'
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

  cfg.API.HTTPHeaders['Access-Control-Allow-Methods'] = ['PUT', 'GET', 'POST']
  await fs.writeJSON(cfgFile, cfg)
}

function setupNoCors () {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    delete details.requestHeaders['Origin']
    callback({ cancel: false, requestHeaders: details.requestHeaders }) // eslint-disable-line
  })
}

export default async function createDaemon ({ type, path, flags, keysize = 0 }) {
  if (type !== 'go') {
    throw new Error(`${type} connection is not supported yet`)
  }

  const factory = IPFSFactory.create({ type: type })

  const ipfsd = await new Promise((resolve, reject) => {
    factory.spawn({
      disposable: false,
      defaultAddrs: true,
      repoPath: path
    }, (e, ipfsd) => {
      if (e) return reject(e)
      if (ipfsd.initialized) {
        return resolve(ipfsd)
      }

      ipfsd.init({
        directory: path,
        keysize: keysize
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
      ipfsd.start(flags, err => {
        if (err) {
          return reject(err)
        }

        resolve()
      })
    })
  }

  setupNoCors(ipfsd.apiUrl)
  return ipfsd
}
