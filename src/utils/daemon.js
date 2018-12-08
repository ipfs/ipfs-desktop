import IPFSFactory from 'ipfsd-ctl'
import logger from './logger'
import { showConnFailureErrorMessage } from './errors'
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

async function spawn ({ type, path, keysize }) {
  const factory = IPFSFactory.create({ type: type })

  return new Promise((resolve, reject) => {
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
}

async function start (ipfsd, { flags }) {
  await new Promise((resolve, reject) => {
    ipfsd.start(flags, err => {
      if (err) {
        return reject(err)
      }

      resolve()
    })
  })
}

export default async function (opts) {
  const ipfsd = await spawn(opts)
  await configure(ipfsd)

  if (!ipfsd.started) {
    await start(ipfsd, opts)
  }

  try {
    await ipfsd.api.id()
  } catch (e) {
    if (!e.message.includes('ECONNREFUSED')) {
      throw e
    }

    if (!showConnFailureErrorMessage(ipfsd.repoPath, ipfsd.apiAddr)) {
      throw new Error('exit')
    }

    repoFsck(ipfsd.repoPath)
    await start(ipfsd, opts)
  }

  return ipfsd
}
