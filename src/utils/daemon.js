import IPFSFactory from 'ipfsd-ctl'
import { showConnFailureErrorMessage } from './errors'
import logger from './logger'
import { app } from 'electron'
import { execFileSync } from 'child_process'
import findExecutable from 'ipfsd-ctl/src/utils/find-ipfs-executable'

function repoFsck (path) {
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

    logger.warn('Connection refused due to API or Lock files')
    if (!showConnFailureErrorMessage(ipfsd.repoPath, ipfsd.apiAddr)) {
      throw new Error('exit')
    }

    repoFsck(ipfsd.repoPath)
    await start(ipfsd, opts)
  }

  return ipfsd
}
