import IPFSFactory from 'ipfsd-ctl'
import logger from './logger'
import fs from 'fs-extra'
import { join } from 'path'
import { dialog, app } from 'electron'

async function cleanup (path) {
  logger.info('Cleaning up repository %s', path)

  const lockFile = join(path, 'repo.lock')
  const apiFile = join(path, 'api')
  const cfgFile = join(path, 'config')

  if (await fs.pathExists(lockFile)) {
    return
  }

  if (!await fs.pathExists(apiFile)) {
    return
  }

  const cfg = await fs.readJSON(cfgFile)
  const cfgAddr = cfg.Addresses ? cfg.Addresses.API : ''
  const addr = (await fs.readFile(apiFile)).toString()
  let clean = cfgAddr === addr

  if (!clean && addr) {
    const option = dialog.showMessageBox({
      type: 'warning',
      title: 'IPFS Desktop',
      message: `We noticed your configured API address doesn't match the API address on your api file (${apiFile}). Do you wish to continue?`,
      buttons: [
        'No',
        'Yes',
        'Yes, but remove the api file'
      ],
      cancelId: 0
    })

    if (option === 0) {
      app.exit(1)
    } else if (option === 1) {
      clean = false
    } else {
      clean = true
    }
  }

  if (clean) {
    logger.info('Removing api file: %s', apiFile)
    return fs.remove(apiFile)
  }
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

  await cleanup(ipfsd.repoPath)

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

  let origins = []
  try {
    origins = await ipfsd.api.config.get('API.HTTPHeaders.Access-Control-Allow-Origin')
  } catch (e) {
    logger.warn(e)
  }

  if (!origins.includes('webui://-')) origins.push('webui://-')
  if (!origins.includes('https://webui.ipfs.io')) origins.push('https://webui.ipfs.io')

  await ipfsd.api.config.set('API.HTTPHeaders.Access-Control-Allow-Origin', origins)
  await ipfsd.api.config.set('API.HTTPHeaders.Access-Control-Allow-Methods', ['PUT', 'GET', 'POST'])

  return ipfsd
}
