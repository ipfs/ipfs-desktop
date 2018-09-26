import fs from 'fs-extra'
import shortid from 'shortid'
import { join } from 'path'
import { ipcMain } from 'electron'
import { logger, store } from '../utils'
import ipfsFactory from 'ipfsd-ctl'
import ipfsApi from 'ipfs-api'

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

const loadConfigurations = ({ send }) => () => {
  const configs = store.get('configs')
  send('ipfsConfigurations', configs)
}

const saveConfig = (opts) => {
  const id = shortid.generate()
  store.set(`configs.${id}`, opts)

  if (!store.get('defaultConfig')) {
    store.set('defaultConfig', id)
  }
}

const addConfiguration = ({ send }) => async (_, { type, apiAddress, path, flags, keysize }) => {
  type = type || 'go'
  apiAddress = apiAddress || ''
  path = path || ''
  flags = flags || []
  keysize = keysize || 4096
  const init = !(await fs.pathExists(path)) || fs.readdirSync(path).length === 0

  if (type === 'api') {
    return saveConfig({ type, apiAddress })
  }

  const factory = ipfsFactory.create({
    type: type,
    exec: type === 'proc' ? require('ipfs') : null
  })

  const error = (e) => {
    logger.warn(e.stack)
    send('addConfigurationError', e.stack)
  }

  factory.spawn({
    init: false,
    start: false,
    disposable: false,
    defaultAddrs: true,
    repoPath: path
  }, (e, ipfsd) => {
    if (e) return error(e)
    if (ipfsd.initialized || !init) return saveConfig({ type, path, flags })

    ipfsd.init({
      directory: path,
      keysize: keysize
    }, e => {
      if (e) return error(e)
      saveConfig({ type, path, flags })
    })
  })
}

export default function (opts) {
  ipcMain.on('loadIpfsConfigurations', loadConfigurations(opts))
  ipcMain.on('addIpfsConfiguration', addConfiguration(opts))
}
