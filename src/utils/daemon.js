import IPFSFactory from 'ipfsd-ctl'
import logger from './logger'
import i18n from 'i18next'
import fs from 'fs-extra'
import { join } from 'path'
import { app } from 'electron'
import { showDialog } from '../dialogs'
import { execFileSync } from 'child_process'
import findExecutable from 'ipfsd-ctl/src/utils/find-ipfs-executable'
import store from './store'

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
  logger.info(`[daemon] cleanup: started`)

  if (!await fs.pathExists(join(path, 'config'))) {
    cannotConnectDialog(addr)
    throw new Error('cannot tonnect to api')
  }

  logger.info(`[daemon] cleanup: ipfs repo fsck ${path}`)
  let exec = findExecutable('go', app.getAppPath())

  try {
    execFileSync(exec, ['repo', 'fsck'], {
      env: {
        ...process.env,
        IPFS_PATH: path
      }
    })
    logger.info('[daemon] cleanup: completed')
  } catch (e) {
    logger.error('[daemon] ', e)
  }
}

function spawn ({ type, path, keysize }) {
  return new Promise((resolve, reject) => {
    const factory = IPFSFactory.create({ type: type })

    factory.spawn({
      disposable: false,
      defaultAddrs: true,
      repoPath: path
    }, (e, ipfsd) => {
      if (e) return reject(e)
      if (ipfsd.initialized) {
        checkCorsConfig(ipfsd)
        return resolve(ipfsd)
      }

      ipfsd.init({
        directory: path,
        keysize: keysize
      }, e => {
        if (e) return reject(e)

        try {
          // Set default mininum and maximum of connections to mantain
          // by default. This only applies to repositories created by
          // IPFS Desktop. Existing ones shall remain intact.
          let config = readConfigFile(ipfsd)
          // Ensure strict CORS checking. See: https://github.com/ipfs/js-ipfsd-ctl/issues/333
          config.API = { HTTPHeaders: {} }
          config.Swarm = config.Swarm || {}
          config.Swarm.DisableNatPortMap = false
          config.Swarm.ConnMgr = config.Swarm.ConnMgr || {}
          config.Swarm.ConnMgr.GracePeriod = '300s'
          config.Swarm.ConnMgr.LowWater = 50
          config.Swarm.ConnMgr.HighWater = 300
          config.Discovery = config.Discovery || {}
          config.Discovery.MDNS = config.Discovery.MDNS || {}
          config.Discovery.MDNS.enabled = true
          writeConfigFile(ipfsd, config)
        } catch (e) {
          return reject(e)
        }

        resolve(ipfsd)
      })
    })
  })
}

function configPath (ipfsd) {
  return join(ipfsd.repoPath, 'config')
}

function readConfigFile (ipfsd) {
  return fs.readJsonSync(configPath(ipfsd))
}

function writeConfigFile (ipfsd, config) {
  fs.writeJsonSync(configPath(ipfsd), config, { spaces: 2 })
}

// Check for a "API.HTTPHeaders.Access-Control-Allow-Origin": ["*"]
function checkCorsConfig (ipfsd) {
  const updatedCorsConfig = store.get('updatedCorsConfig')
  let config = readConfigFile(ipfsd)
  if (config.API && config.API.HTTPHeaders && config.API.HTTPHeaders['Access-Control-Allow-Methods']) {
    let apiHeaders = config.API.HTTPHeaders['Access-Control-Allow-Methods']
    if (Array.isArray(apiHeaders) && apiHeaders.includes('*')) {
      if (!updatedCorsConfig && apiHeaders.length === 1) {
        config.API.HTTPHeaders['Access-Control-Allow-Methods'] = [] // go-ipfs default
        writeConfigFile(ipfsd, config)
        store.set('updatedCorsConfig', true)
      }
    }
  }
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
