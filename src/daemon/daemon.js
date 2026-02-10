const Ctl = require('ipfsd-ctl')
const logger = require('../common/logger')
const { getCustomBinary } = require('../custom-ipfs-binary')
const { applyDefaults, migrateConfig, checkPorts, configExists, checkRepositoryAndConfiguration, removeApiFile, apiFileExists } = require('./config')
const showMigrationPrompt = require('./migration-prompt')
const dialogs = require('./dialogs')
const { app } = require('electron')

const ipfsHttpModulePromise = Promise.all([
  import('ipfs-http-client'),
  import('@multiformats/multiaddr-to-uri')
]).then(([mod, toUriMod]) => {
  const toUri = toUriMod.multiaddrToUri ?? toUriMod.default ?? toUriMod

  // ipfs-http-client is ESM-only in newer versions. Normalize for CJS callers.
  const client = mod.create ? mod : (mod.default ?? mod)
  if (!client || typeof client.create !== 'function') return client

  // ipfsd-ctl may pass a multiaddr (e.g. /ip4/127.0.0.1/tcp/5001) as the API address.
  // ipfs-http-client v60 expects a URL, so convert multiaddr to http(s) URL.
  return Object.assign({}, client, {
    create: (addr, opts) => {
      // Normalize common multiaddr shapes to a URL string that ipfs-http-client accepts.
      if (typeof addr === 'string' && addr.startsWith('/')) {
        const ma = addr.includes('/http') ? addr : `${addr}/http`
        return client.create(toUri(ma), opts)
      }
      if (addr && typeof addr.toString === 'function') {
        const value = addr.toString()
        if (typeof value === 'string' && value.startsWith('/')) {
          const ma = value.includes('/http') ? value : `${value}/http`
          return client.create(toUri(ma), opts)
        }
      }
      if (addr && typeof addr === 'object' && typeof addr.url === 'string' && addr.url.startsWith('/')) {
        const ma = addr.url.includes('/http') ? addr.url : `${addr.url}/http`
        return client.create(Object.assign({}, addr, { url: toUri(ma) }), opts)
      }
      return client.create(addr, opts)
    }
  })
})

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
 * @returns {Promise<import('ipfsd-ctl').Controller|null>}
 */
async function getIpfsd (flags, path) {
  const ipfsBin = getIpfsBinPath()
  const ipfsHttpModule = await ipfsHttpModulePromise

  const ipfsd = await Ctl.createController({
    ipfsHttpModule,
    ipfsBin,
    ipfsOptions: {
      repo: path
    },
    remote: false,
    disposable: false,
    test: false,
    args: flags
  })

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
 * @param {import('ipfsd-ctl').Controller} ipfsd
 * @returns {Promise<IpfsLogs>}
 */
async function startIpfsWithLogs (ipfsd) {
  let err, id, migrationPrompt
  let isMigrating, isErrored, isFinished
  let logs = ''

  const isSpawnedDaemonDead = (ipfsd) => {
    if (typeof ipfsd.subprocess === 'undefined') throw new Error('undefined ipfsd.subprocess, unable to reason about startup errors')
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
    await ipfsd.start()
    const idRes = await ipfsd.api.id()
    id = idRes.id
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
 * @returns {Promise<{ ipfsd: import('ipfsd-ctl').Controller|undefined } & IpfsLogs>}
 */
async function startDaemon (opts) {
  const ipfsd = await getIpfsd(opts.flags, opts.path)
  if (ipfsd === null) {
    app.quit()
    return { ipfsd: undefined, err: new Error('get ipfsd failed'), id: undefined, logs: '' }
  }

  let { err, logs, id } = await startIpfsWithLogs(ipfsd)
  if (err) {
    if (!err.message.includes('ECONNREFUSED') && !err.message.includes('ERR_CONNECTION_REFUSED')) {
      return { ipfsd, err, logs, id }
    }

    if (!configExists(ipfsd)) {
      dialogs.cannotConnectToApiDialog(ipfsd.apiAddr.toString())
      return { ipfsd, err, logs, id }
    }

    logger.info('[daemon] removing api file')
    removeApiFile(ipfsd)

    const errLogs = await startIpfsWithLogs(ipfsd)
    err = errLogs.err
    logs = errLogs.logs
    id = errLogs.id
  }

  // If we have an error here, it should have been handled by startIpfsWithLogs.
  return { ipfsd, err, logs, id }
}

module.exports = startDaemon
