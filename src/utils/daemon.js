import IPFSFactory from 'ipfsd-ctl'
import { join } from 'path'
import fs from 'fs-extra'
import logger from './logger'

export default async function createDaemon (opts) {
  opts.type = opts.type || 'go'
  opts.path = opts.path || ''
  opts.flags = opts.flags || ['--migrate=true', '--routing=dhtclient']
  opts.keysize = opts.keysize || 4096

  const init = !(await fs.pathExists(opts.path)) || fs.readdirSync(opts.path).length === 0

  logger.info('init > > '+ init)

  if (!init) {
    await cleanLocks(opts.path)
  }

  const factory = IPFSFactory.create({ type: opts.type })
  logger.info('type > > '+ opts.type)

  const ipfsd = await new Promise((resolve, reject) => {
    factory.spawn({
      init: false,
      start: false,
      disposable: false,
      defaultAddrs: true,
      repoPath: opts.path
    }, (e, ipfsd) => {
      if (e) return reject(e)
      if (ipfsd.initialized || !init) {
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

  logger.info('> > > before . . . ' + ipfsd.started)

  if (!ipfsd.started) {
    await new Promise((resolve, reject) => {
      ipfsd.start(opts.flags, err => {
        if (err) {
          logger.info('err: ', err)
          return reject(err)
        }

        resolve()
      })
    })
  }

  logger.info('> > > after . . . ' + ipfsd.started)

  let origins = await ipfsd.api.config.get('API.HTTPHeaders.Access-Control-Allow-Origin').catch(err => logger.info('err '+ err)) || []
  if (!origins.includes('webui://-')) origins.push('webui://-')
  if (!origins.includes('https://webui.ipfs.io')) origins.push('https://webui.ipfs.io')

  await ipfsd.api.config.set('API.HTTPHeaders.Access-Control-Allow-Origin', origins)
  await ipfsd.api.config.set('API.HTTPHeaders.Access-Control-Allow-Method', ['PUT', 'GET', 'POST'])

  return ipfsd
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
