import IPFSFactory from 'ipfsd-ctl'
import i18n from 'i18next'
import fs from 'fs-extra'
import { join } from 'path'
import { app } from 'electron'
import { execFileSync } from 'child_process'
import findExecutable from 'ipfsd-ctl/src/utils/find-ipfs-executable'
import { showDialog } from '../dialogs'
import logger from '../common/logger'
import { applyDefaults, checkCorsConfig, checkPorts } from './config'

function cannotConnectDialog (addr) {
  showDialog({
    title: i18n.t('cannotConnectToApiDialog.title'),
    message: i18n.t('cannotConnectToApiDialog.message', { addr }),
    type: 'error',
    buttons: [
      i18n.t('close')
    ]
  })
}

async function cleanup (addr, path) {
  logger.info('[daemon] cleanup: started')

  if (!await fs.pathExists(join(path, 'config'))) {
    cannotConnectDialog(addr)
    throw new Error('cannot tonnect to api')
  }

  logger.info(`[daemon] cleanup: ipfs repo fsck ${path}`)
  const exec = findExecutable('go', app.getAppPath())

  try {
    execFileSync(exec, ['repo', 'fsck'], {
      env: {
        ...process.env,
        IPFS_PATH: path
      }
    })
    logger.info('[daemon] cleanup: completed')
  } catch (err) {
    logger.error(`[daemon] ${err.toString()}`)
  }
}

async function spawn ({ type, path, keysize }) {
  const factory = IPFSFactory.create({ type: type })

  const ipfsd = await factory.spawn({
    disposable: false,
    defaultAddrs: true,
    repoPath: path,
    init: false,
    start: false
  })

  if (ipfsd.initialized) {
    checkCorsConfig(ipfsd)
    return ipfsd
  }

  await ipfsd.init({
    directory: path,
    keysize: keysize
  })

  applyDefaults(ipfsd)
  return ipfsd
}

export default async function (opts) {
  const ipfsd = await spawn(opts)
  await checkPorts(ipfsd)
  await ipfsd.start(opts.flags)

  try {
    await ipfsd.api.id()
  } catch (err) {
    if (!err.message.includes('ECONNREFUSED')) {
      throw err
    }

    await cleanup(ipfsd.apiAddr, ipfsd.repoPath)
    await ipfsd.start(opts.flags)
  }

  return ipfsd
}
