const { join } = require('path')
const os = require('os')
const fs = require('fs-extra')
const logger = require('../common/logger')
const { getCustomBinary } = require('../custom-ipfs-binary')
const { applyDefaults, migrateConfig, checkPorts, configExists, checkRepositoryAndConfiguration, removeApiFile, apiFileExists } = require('./config')
const showMigrationPrompt = require('./migration-prompt')
const dialogs = require('./dialogs')
const { app } = require('electron')

const ipfsdCtlPromise = import('ipfsd-ctl').then((mod) => mod.createNode ?? mod.default?.createNode ?? mod.default)
const ipfsHttpModulePromise = Promise.all([
  import('kubo-rpc-client'),
  import('@multiformats/multiaddr-to-uri')
]).then(([rpcMod, toUriMod]) => {
  const create = rpcMod.create ?? rpcMod.default?.create ?? rpcMod.default
  const toUri = toUriMod.multiaddrToUri ?? toUriMod.default ?? toUriMod
  return {
    create: (addr) => {
      if (typeof addr === 'string' && addr.startsWith('/')) {
        return create(toUri(addr))
      }
      if (addr && typeof addr.toString === 'function') {
        const value = addr.toString()
        if (value.startsWith('/')) {
          return create(toUri(value))
        }
      }
      return create(addr)
    }
  }
})

async function apiFileIsLive (ipfsd) {
  if (!apiFileExists(ipfsd)) return false
  try {
    const apiAddr = fs.readFileSync(join(ipfsd.path, 'api'), 'utf8').trim()
    const rpc = await ipfsHttpModulePromise
    const client = rpc.create(apiAddr)
    await Promise.race([
      client.id(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('id timeout')), 1000))
    ])
    return true
  } catch (_) {
    return false
  }
}

/**
 * Get the IPFS binary file path.
 *
 * @returns {string}
 */
function getIpfsBinPath () {
  return process.env.IPFS_GO_EXEC ||
    getCustomBinary() ||
    require('kubo')
      .path()
      .replace('app.asar', 'app.asar.unpacked')
}

/**
 * Gets the IPFS daemon controller. If null is returned,
 * it means that the repository or some configuration is wrong
 * and IPFS Desktop should quit.
 *
 * @param {string[]} flags
 * @param {string} path
 * @returns {Promise<import('ipfsd-ctl').KuboNode|null>}
 */
async function getIpfsd (flags, path) {
  const ipfsBin = getIpfsBinPath()
  const createNode = await ipfsdCtlPromise
  const rpc = await ipfsHttpModulePromise
  const repoPath = (typeof path === 'string' && path.trim() !== '')
    ? path
    : join(os.homedir(), '.ipfs')

  const ipfsd = await createNode({
    type: 'kubo',
    rpc: rpc.create,
    bin: ipfsBin,
    repo: repoPath,
    init: false,
    start: false,
    remote: false,
    disposable: false,
    test: false
  })

  ipfsd.path = ipfsd.repo
  const info = await ipfsd.info()
  ipfsd.apiAddr = info.api
  ipfsd.gatewayAddr = info.gateway

  // Checks if the repository is valid to use with IPFS Desktop. If not,
  // we quit the app. We assume that checkRepositoryAndConfiguration
  // presents any dialog explaining the situation.
  if (!checkRepositoryAndConfiguration(ipfsd)) {
    return null
  }

  let isRemote = false

  if (configExists(ipfsd)) {
    await migrateConfig(ipfsd)
  } else {
    // If config does not exist, but $IPFS_PATH/api exists
    // then it is a remote repository.
    isRemote = apiFileExists(ipfsd)
    if (!isRemote) {
      // It's a new repository!
      await ipfsd.init()
      applyDefaults(ipfsd)
    }
  }

  if (!isRemote) {
    // Check if ports are free and we're clear to start IPFS.
    // If not, we return null.
    if (!await checkPorts(ipfsd)) {
      return null
    }
  }

  return ipfsd
}

function listenToIpfsLogs (ipfsd, callback) {
  let stdout, stderr

  const listener = data => {
    callback(data.toString())
  }

  const interval = setInterval(() => {
    if (!ipfsd.subprocess) {
      return
    }

    stdout = ipfsd.subprocess.stdout
    stderr = ipfsd.subprocess.stderr

    stdout.on('data', listener)
    stderr.on('data', listener)

    clearInterval(interval)
  }, 20)

  const stop = () => {
    clearInterval(interval)

    if (stdout) stdout.removeListener('data', listener)
    if (stderr) stderr.removeListener('data', listener)
  }

  return stop
}

/**
 * @typedef {object} IpfsLogs
 * @property {string} logs
 * @property {string|undefined} id
 * @property {any} err
 */

/**
 * Start IPFS, collects the logs, detects errors and migrations.
 *
 * @param {import('ipfsd-ctl').KuboNode} ipfsd
 * @param {string[]} flags
 * @returns {Promise<IpfsLogs>}
 */
async function startIpfsWithLogs (ipfsd, flags) {
  let err, id, migrationPrompt
  let isMigrating, isErrored, isFinished
  let logs = ''
  const getAddrFromConfig = () => {
    try {
      const config = fs.readJsonSync(join(ipfsd.path, 'config'))
      const pickAddr = (addr) => Array.isArray(addr)
        ? (addr.find(v => v.includes('127.0.0.1')) || addr[0])
        : addr
      return {
        api: pickAddr(config?.Addresses?.API),
        gateway: pickAddr(config?.Addresses?.Gateway)
      }
    } catch {
      return { api: undefined, gateway: undefined }
    }
  }

  const isSpawnedDaemonDead = (ipfsd) => {
    if (typeof ipfsd.subprocess === 'undefined') return false // not exposed by ipfsd-ctl (ESM)
    if (ipfsd.subprocess === null) return false // not spawned yet or remote
    if (ipfsd.subprocess?.failed) return true // explicit failure

    // detect when spawned ipfsd process is gone/dead
    // by inspecting its pid - it should be alive
    const { pid } = ipfsd.subprocess
    try {
      // signal 0 throws if process is missing, noop otherwise
      process.kill(pid, 0)
      return false
    } catch (e) {
      return true
    }
  }

  const stopListening = listenToIpfsLogs(ipfsd, data => {
    logs += data.toString()
    const line = data.toLowerCase()
    isMigrating = isMigrating || line.includes('migration')
    isErrored = isErrored || isSpawnedDaemonDead(ipfsd)
    isFinished = isFinished || line.includes('daemon is ready')

    if (!isMigrating && !isErrored) {
      return
    }

    if (!migrationPrompt) {
      logger.info('[daemon] ipfs data store is migrating')
      migrationPrompt = showMigrationPrompt(logs, isErrored, isFinished)
      return
    }

    if (isErrored || isFinished) {
      // forced show on error or when finished,
      // because user could close it to run in background
      migrationPrompt.loadWindow(logs, isErrored, isFinished)
    } else { // update progress if the window is still around
      migrationPrompt.update(logs)
    }
  })

  try {
    if (apiFileExists(ipfsd) && !await apiFileIsLive(ipfsd)) {
      logger.info('[daemon] removing stale api file')
      removeApiFile(ipfsd)
    }
    await ipfsd.start({ args: flags })
    // RPC can lag briefly after daemon readiness logs, so retry id().
    const maxAttempts = 5
    const retryDelayMs = 500
    let idOk = false
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const idRes = await ipfsd.api.id()
        id = idRes.id
        idOk = true
        break
      } catch (err) {
        if (attempt === maxAttempts) {
          logger.error(`[ipfsd] id() failed after retries: ${err.message || err}`)
          break
        }
        await new Promise(resolve => setTimeout(resolve, retryDelayMs))
      }
    }
    if (idOk) {
      try {
        const info = await ipfsd.info()
        ipfsd.apiAddr = info.api
        ipfsd.gatewayAddr = info.gateway
      } catch (infoErr) {
        logger.error(`[ipfsd] info() failed: ${infoErr.message || infoErr}`)
      }
    }
    if (!ipfsd.apiAddr || !ipfsd.gatewayAddr) {
      const { api, gateway } = getAddrFromConfig()
      ipfsd.apiAddr = ipfsd.apiAddr || api
      ipfsd.gatewayAddr = ipfsd.gatewayAddr || gateway
    }
  } catch (e) {
    err = e
  } finally {
    // stop monitoring daemon output - we only care about startup phase
    stopListening()

    // Show startup error using the same UI as migrations.
    // This is catch-all that will show stdout/stderr of ipfs daemon
    // that failed to start, allowing user to self-diagnose or report issue.
    isErrored = isErrored || isSpawnedDaemonDead(ipfsd)
    if (isErrored) { // save daemon output to error.log
      if (logs.trim().length === 0) {
        logs = 'ipfs daemon failed to start and produced no output (see error.log for details)'
      }
      logger.error(logs)
      if (migrationPrompt) {
        migrationPrompt.loadWindow(logs, isErrored, isFinished)
      } else {
        showMigrationPrompt(logs, isErrored, isFinished)
      }
    }
  }

  return {
    err, id, logs
  }
}

/**
 * Start the IPFS daemon.
 *
 * @param {any} opts
 * @returns {Promise<{ ipfsd: import('ipfsd-ctl').KuboNode|undefined } & IpfsLogs>}
 */
async function startDaemon (opts) {
  const ipfsd = await getIpfsd(opts.flags, opts.path)
  if (ipfsd === null) {
    app.quit()
    return { ipfsd: undefined, err: new Error('get ipfsd failed'), id: undefined, logs: '' }
  }

  let { err, logs, id } = await startIpfsWithLogs(ipfsd, opts.flags)
  if (err) {
    if (!err.message.includes('ECONNREFUSED') && !err.message.includes('ERR_CONNECTION_REFUSED')) {
      return { ipfsd, err, logs, id }
    }

    if (!configExists(ipfsd)) {
      dialogs.cannotConnectToApiDialog(String(ipfsd.apiAddr))
      return { ipfsd, err, logs, id }
    }

    logger.info('[daemon] removing api file')
    removeApiFile(ipfsd)

    const errLogs = await startIpfsWithLogs(ipfsd, opts.flags)
    err = errLogs.err
    logs = errLogs.logs
    id = errLogs.id
  }

  // If we have an error here, it should have been handled by startIpfsWithLogs.
  return { ipfsd, err, logs, id }
}

module.exports = startDaemon
