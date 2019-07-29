import IPFSFactory from 'ipfsd-ctl'
import i18n from 'i18next'
import fs from 'fs-extra'
import { join } from 'path'
import { app } from 'electron'
import { execFileSync } from 'child_process'
import findExecutable from 'ipfsd-ctl/src/utils/find-ipfs-executable'
import multiaddr from 'multiaddr'
import http from 'http'
import getPort from 'get-port'
import { showDialog } from '../dialogs'
import store from '../common/store'
import logger from '../common/logger'

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
  const exec = findExecutable('go', app.getAppPath())

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

  // Set default mininum and maximum of connections to mantain
  // by default. This only applies to repositories created by
  // IPFS Desktop. Existing ones shall remain intact.
  const config = readConfigFile(ipfsd)
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

  return ipfsd
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

async function checkIfAddrIsDaemon (addr) {
  const options = {
    method: 'GET',
    host: addr.address,
    port: addr.port,
    path: '/api/v0/refs?arg=/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'
  }

  return new Promise(resolve => {
    var req = http.request(options, function (r) {
      resolve(r.statusCode === 200)
    })

    req.on('error', () => {
      resolve(false)
    })

    req.end()
  })
}

const parseCfgMultiaddr = (addr) => (addr.includes('/http')
  ? multiaddr(addr)
  : multiaddr(addr).encapsulate('/http')
)

async function checkPorts (ipfsd) {
  const config = readConfigFile(ipfsd)

  const configApiMa = parseCfgMultiaddr(config.Addresses.API)
  const configGatewayMa = parseCfgMultiaddr(config.Addresses.Gateway)

  const isApiMaDaemon = await checkIfAddrIsDaemon(configApiMa.nodeAddress())
  const isGatewayMaDaemon = await checkIfAddrIsDaemon(configGatewayMa.nodeAddress())

  if (isApiMaDaemon && isGatewayMaDaemon) {
    logger.info('[daemon] ports busy by a daemon')
    return true
  }

  const apiPort = parseInt(configApiMa.nodeAddress().port, 10)
  const gatewayPort = parseInt(configGatewayMa.nodeAddress().port, 10)

  const freeGatewayPort = await getPort({ port: getPort.makeRange(gatewayPort, gatewayPort + 100) })
  const freeApiPort = await getPort({ port: getPort.makeRange(apiPort, apiPort + 100) })

  const busyApiPort = apiPort !== freeApiPort
  const busyGatewayPort = gatewayPort !== freeGatewayPort

  if (!busyApiPort && !busyGatewayPort) {
    return
  }

  let message = null
  let options = null

  if (busyApiPort && busyGatewayPort) {
    logger.info('[daemon] api and gateway ports busy')
    message = 'busyPortsDialog'
    options = {
      port1: apiPort,
      alt1: freeApiPort,
      port2: gatewayPort,
      alt2: freeGatewayPort
    }
  } else if (busyApiPort) {
    logger.info('[daemon] api port busy')
    message = 'busyPortDialog'
    options = {
      port: apiPort,
      alt: freeApiPort
    }
  } else {
    logger.info('[daemon] gateway port busy')
    message = 'busyPortDialog'
    options = {
      port: gatewayPort,
      alt: freeGatewayPort
    }
  }

  const opt = showDialog({
    title: i18n.t(`${message}.title`),
    message: i18n.t(`${message}.message`, options),
    type: 'error',
    buttons: [
      i18n.t(`${message}.action`, options),
      i18n.t('close')
    ]
  })

  if (opt !== 0) {
    throw new Error('ports already being used')
  }

  if (busyApiPort) {
    config.Addresses.API = config.Addresses.API.replace(apiPort.toString(), freeApiPort.toString())
  }

  if (busyGatewayPort) {
    config.Addresses.Gateway = config.Addresses.Gateway.replace(gatewayPort.toString(), freeGatewayPort.toString())
  }

  writeConfigFile(ipfsd, config)
  logger.info('[daemon] ports updated')
}

export default async function (opts) {
  const ipfsd = await spawn(opts)

  if (!ipfsd.started) {
    await checkPorts(ipfsd)
    await ipfsd.start(opts.flags)
  }

  try {
    await ipfsd.api.id()
  } catch (e) {
    if (!e.message.includes('ECONNREFUSED')) {
      throw e
    }

    await cleanup(ipfsd.apiAddr, ipfsd.repoPath)
    await ipfsd.start(opts.flags)
  }

  return ipfsd
}
