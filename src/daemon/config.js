const { join } = require('path')
const fs = require('fs-extra')
const { multiaddr } = require('multiaddr')
const http = require('http')
const portfinder = require('portfinder')
const { shell } = require('electron')
const i18n = require('i18next')
const { showDialog } = require('../dialogs')
const store = require('../common/store')
const logger = require('../common/logger')

function configExists (ipfsd) {
  return fs.pathExistsSync(join(ipfsd.path, 'config'))
}

function apiFileExists (ipfsd) {
  return fs.pathExistsSync(join(ipfsd.path, 'api'))
}

function rmApiFile (ipfsd) {
  return fs.removeSync(join(ipfsd.path, 'api'))
}

function configPath (ipfsd) {
  return join(ipfsd.path, 'config')
}

function readConfigFile (ipfsd) {
  return fs.readJsonSync(configPath(ipfsd))
}

function writeConfigFile (ipfsd, config) {
  fs.writeJsonSync(configPath(ipfsd), config, { spaces: 2 })
}

// Set default minimum and maximum of connections to maintain
// by default. This must only be called for repositories created
// by IPFS Desktop. Existing ones shall remain intact.
function applyDefaults (ipfsd) {
  const config = readConfigFile(ipfsd)

  // Ensure strict CORS checking
  // See: https://github.com/ipfs/js-ipfsd-ctl/issues/333
  config.API = { HTTPHeaders: {} }

  config.Swarm = config.Swarm || {}
  config.Swarm.DisableNatPortMap = false
  config.Swarm.ConnMgr = config.Swarm.ConnMgr || {}
  config.Swarm.ConnMgr.GracePeriod = '300s'
  config.Swarm.ConnMgr.LowWater = 50
  config.Swarm.ConnMgr.HighWater = 300

  config.Discovery = config.Discovery || {}
  config.Discovery.MDNS = config.Discovery.MDNS || {}
  config.Discovery.MDNS.Enabled = true

  writeConfigFile(ipfsd, config)
}

function getGatewayPort (config) {
  let gatewayUrl = null

  if (Array.isArray(config.Addresses.Gateway)) {
    gatewayUrl = config.Addresses.Gateway.find(v => v.includes('127.0.0.1'))
  } else {
    gatewayUrl = config.Addresses.Gateway
  }

  const gw = parseCfgMultiaddr(gatewayUrl)
  return gw.nodeAddress().port
}

// Apply one-time updates to the config of IPFS node.
// This is the place where we execute fixes and performance tweaks for existing users.
function migrateConfig (ipfsd) {
  // Bump revision number when new migration rule is added
  const REVISION = 2
  const REVISION_KEY = 'daemonConfigRevision'
  const CURRENT_REVISION = store.get(REVISION_KEY, 0)

  // Migration is applied only once per revision
  if (CURRENT_REVISION >= REVISION) return

  // Read config
  let config = null
  let changed = false
  try {
    config = readConfigFile(ipfsd)
  } catch (err) {
    // This is a best effort check, dont blow up here, that should happen else where.
    logger.error(`[daemon] migrateConfig: error reading config file: ${err.message || err}`)
    return
  }

  if (CURRENT_REVISION <= 0) {
    // Cleanup https://github.com/ipfs-shipyard/ipfs-desktop/issues/1631
    if (config.Discovery && config.Discovery.MDNS && config.Discovery.MDNS.enabled) {
      config.Discovery.MDNS.Enabled = config.Discovery.MDNS.Enabled || true
      delete config.Discovery.MDNS.enabled
      changed = true
    }
  }

  if (CURRENT_REVISION <= 1) {
    const api = config.API || {}
    const httpHeaders = api.HTTPHeaders || {}
    const accessControlAllowOrigin = httpHeaders['Access-Control-Allow-Origin'] || []

    const addURL = url => {
      if (!accessControlAllowOrigin.includes(url)) {
        accessControlAllowOrigin.push(url)
        return true
      }
      return false
    }

    const addedWebUI = addURL('https://webui.ipfs.io')
    const addedGw = addURL(`http://webui.ipfs.io.ipns.localhost:${getGatewayPort(config)}`)

    if (addedWebUI || addedGw) {
      httpHeaders['Access-Control-Allow-Origin'] = accessControlAllowOrigin
      api.HTTPHeaders = httpHeaders
      config.API = api
      changed = true
    }
  }

  // TODO: update config.Swarm.ConnMgr.*

  if (changed) {
    try {
      writeConfigFile(ipfsd, config)
      store.set(REVISION_KEY, REVISION)
    } catch (err) {
      logger.error(`[daemon] migrateConfig: error writing config file: ${err.message || err}`)
      return
    }
  }
  store.set(REVISION_KEY, REVISION)
}

const parseCfgMultiaddr = (addr) => (addr.includes('/http')
  ? multiaddr(addr)
  : multiaddr(addr).encapsulate('/http')
)

async function checkIfAddrIsDaemon (addr) {
  const options = {
    timeout: 3000, // 3s is plenty for localhost request
    method: 'POST',
    host: addr.address,
    port: addr.port,
    path: '/api/v0/refs?arg=/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'
  }

  return new Promise(resolve => {
    const req = http.request(options, function (r) {
      resolve(r.statusCode === 200)
    })

    req.on('error', () => {
      resolve(false)
    })

    req.end()
  })
}

async function checkPortsArray (ipfsd, addrs) {
  addrs = addrs.filter(Boolean)

  for (const addr of addrs) {
    const ma = parseCfgMultiaddr(addr)
    const port = parseInt(ma.nodeAddress().port, 10)

    if (port === 0) {
      continue
    }

    const isDaemon = await checkIfAddrIsDaemon(ma.nodeAddress())

    if (isDaemon) {
      continue
    }

    const freePort = await portfinder.getPortPromise({ port: port, stopPort: port + 100 })

    if (port !== freePort) {
      const opt = showDialog({
        title: i18n.t('multipleBusyPortsDialog.title'),
        message: i18n.t('multipleBusyPortsDialog.message'),
        type: 'error',
        buttons: [
          i18n.t('multipleBusyPortsDialog.action'),
          i18n.t('close')
        ]
      })

      if (opt === 0) {
        shell.openPath(join(ipfsd.path, 'config'))
      }

      throw new Error('ports already being used')
    }
  }
}

async function checkPorts (ipfsd) {
  const config = readConfigFile(ipfsd)

  const apiIsArr = Array.isArray(config.Addresses.API)
  const gatewayIsArr = Array.isArray(config.Addresses.Gateway)

  if (apiIsArr || gatewayIsArr) {
    logger.info('[daemon] custom configuration with array of API or Gateway addrs')
    return checkPortsArray(ipfsd, [].concat(config.Addresses.API, config.Addresses.Gateway))
  }

  const configApiMa = parseCfgMultiaddr(config.Addresses.API)
  const configGatewayMa = parseCfgMultiaddr(config.Addresses.Gateway)

  const isApiMaDaemon = await checkIfAddrIsDaemon(configApiMa.nodeAddress())
  const isGatewayMaDaemon = await checkIfAddrIsDaemon(configGatewayMa.nodeAddress())

  if (isApiMaDaemon && isGatewayMaDaemon) {
    logger.info('[daemon] ports busy by a daemon')
    return
  }

  const apiPort = parseInt(configApiMa.nodeAddress().port, 10)
  const gatewayPort = parseInt(configGatewayMa.nodeAddress().port, 10)

  const findFreePort = async (port, from) => {
    port = Math.max(port, from, 1024)
    return portfinder.getPortPromise({ port, stopPort: port + 100 })
  }

  const freeGatewayPort = await findFreePort(gatewayPort, 8080)
  const freeApiPort = await findFreePort(apiPort, 5001)

  const busyApiPort = apiPort !== freeApiPort
  const busyGatewayPort = gatewayPort !== freeGatewayPort

  if (!busyApiPort && !busyGatewayPort) {
    return
  }

  // two "0" in config mean "pick free ports without any prompt"
  const promptUser = (apiPort !== 0 || gatewayPort !== 0)

  if (promptUser) {
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

module.exports = Object.freeze({
  configPath,
  configExists,
  apiFileExists,
  rmApiFile,
  applyDefaults,
  migrateConfig,
  checkPorts
})
