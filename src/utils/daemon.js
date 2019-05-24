import IPFSFactory from 'ipfsd-ctl'
import logger from './logger'
import fs from 'fs-extra'
import { join } from 'path'
import { app } from 'electron'
import { cannotConnectToAPI } from './errors'
import { execFileSync } from 'child_process'
import findExecutable from 'ipfsd-ctl/src/utils/find-ipfs-executable'
import store from './store'

async function cleanup (addr, path) {
  logger.info(`[daemon] cleanup: started`)

  if (!await fs.pathExists(join(path, 'config'))) {
    cannotConnectToAPI(addr)
    return
  }

  logger.info(`[daemon] cleanup: ipfs repo fsck ${path}`)
  let exec = findExecutable('go', app.getAppPath())
  execFileSync(exec, ['repo', 'fsck'], {
    env: {
      ...process.env,
      IPFS_PATH: path
    }
  })
  logger.info(`[daemon] cleanup: completed`)
}

function spawn ({ type, path, keysize }) {
  return new Promise((resolve, reject) => {
    const factory = IPFSFactory.create({ type: type })

    factory.spawn({
      disposable: false,
      defaultAddrs: true,
      repoPath: path,
      init: false,
      start: false
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

// Check for * and webui://- in allowed origins on API headers.
// THe wildcard was a ipfsd-ctl default, that we dont want, and webui://- was an
// earlier experiement that should be cleared out.
//
// We remove them the first time we find them. If we find it again on subsequent
// runs then we leave them in, under the assumption that you really want it.
// TODO: show warning in UI when wildcard is in the allowed origins.
function checkCorsConfig (ipfsd) {
  if (store.get('checkedCorsConfig')) {
    // We've already checked so skip it.
    return
  }
  let config = null
  try {
    config = readConfigFile(ipfsd)
  } catch (err) {
    // This is a best effort check, dont blow up here, that should happen else where.
    // TODO: gracefully handle config errors elsewhere!
    logger.error(`[daemon] checkCorsConfig: error reading config file: ${err.message || err}`)
    return
  }
  if (config.API && config.API.HTTPHeaders && config.API.HTTPHeaders['Access-Control-Allow-Origin']) {
    const allowedOrigins = config.API.HTTPHeaders['Access-Control-Allow-Origin']
    const originsToRemove = ['*', 'webui://-']
    if (Array.isArray(allowedOrigins)) {
      if (allowedOrigins.some(origin => originsToRemove.includes(origin))) {
        const specificOrigins = allowedOrigins.filter(origin => !originsToRemove.includes(origin))
        config.API.HTTPHeaders['Access-Control-Allow-Origin'] = specificOrigins
        try {
          writeConfigFile(ipfsd, config)
          store.set('updatedCorsConfig', Date.now())
        } catch (err) {
          logger.error(`[daemon] checkCorsConfig: error writing config file: ${err.message || err}`)
          // dont skip setting checkedCorsConfig so we try again next time time.
          return
        }
      }
    }
  }
  store.set('checkedCorsConfig', true)
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
