import IPFSFactory from 'ipfsd-ctl'
import logger from './logger'
import fs from 'fs-extra'
import { join } from 'path'
import { app } from 'electron'
import { cannotConnectToAPI } from './errors'
import { execFileSync } from 'child_process'
import findExecutable from 'ipfsd-ctl/src/utils/find-ipfs-executable'

async function cleanup (addr, path) {
  logger.info(`Entering cleanup stage`)

  if (!await fs.pathExists(join(path, 'config'))) {
    cannotConnectToAPI(addr)
    return
  }

  logger.info(`Running 'ipfs repo fsck' on %s`, path)
  let exec = findExecutable('go', app.getAppPath())
  execFileSync(exec, ['repo', 'fsck'], {
    env: {
      ...process.env,
      IPFS_PATH: path
    }
  })
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

  if (!ipfsd.started) {
    await start(ipfsd, opts)
  }

  try {
    await ipfsd.api.id()
  } catch (e) {
    if (!e.message.includes('ECONNREFUSED')) {
      throw e
    }

    await cleanup(ipfsd.apiAddr, ipfsd.repoPath)
    await start(ipfsd, opts)
  }

  return ipfsd
}
