import Ctl from 'ipfsd-ctl'
import i18n from 'i18next'
import { execFileSync } from 'child_process'
import { findBin } from 'ipfsd-ctl/src/utils'
import { showDialog } from '../dialogs'
import logger from '../common/logger'
import { applyDefaults, checkCorsConfig, checkPorts, configExists } from './config'

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

async function cleanup (ipfsd) {
  const log = logger.start('[daemon] cleanup')

  if (!configExists(ipfsd.path)) {
    cannotConnectDialog(ipfsd.apiAddr)
    throw new Error('cannot connect to api')
  }

  log.info('run: ipfs repo fsck')
  const exec = findBin('go')

  try {
    execFileSync(exec, ['repo', 'fsck'], {
      env: {
        ...process.env,
        IPFS_PATH: ipfsd.path
      }
    })
    log.end()
  } catch (err) {
    log.fail(err)
  }
}

async function spawn ({ type, path, flags, keysize }) {
  // NOTE: presence of env variable IPFS_PATH overrides config
  path = process.env.IPFS_PATH || path

  const factory = Ctl.createFactory({
    remote: false,
    disposable: false,
    test: false,
    args: flags,
    type: type
  })

  const ipfsd = await factory.spawn({
    ipfsOptions: {
      repo: path
    },
    init: false,
    start: false
  })

  // old:  if (ipfsd.initialized) {  TODO: ipfsd.initialized is not set properly when Ctl's factory.spawn is called with init: false
  if (configExists(ipfsd.path)) {
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
  await ipfsd.start()

  try {
    const { id } = await ipfsd.api.id()
    logger.info(`[daemon] PeerID is ${id}`)
  } catch (err) {
    if (!err.message.includes('ECONNREFUSED')) {
      throw err
    }

    await cleanup(ipfsd)
    await ipfsd.start()
  }

  return ipfsd
}
