const logger = require('../common/logger')
const { getCustomBinary } = require('../custom-ipfs-binary')
const { applyDefaults, migrateConfig, checkPorts, configExists, checkRepositoryAndConfiguration, removeApiFile, apiFileExists } = require('./config')
const showMigrationPrompt = require('./migration-prompt')
const dialogs = require('./dialogs')
const { app } = require('electron')
const { getModules } = require('../esm-loader')

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
  const { createNode, create } = getModules()

  // Use explicit path, or IPFS_PATH env var, or default to ~/.ipfs
  const repoPath = (path && path.length > 0)
    ? path
    : process.env.IPFS_PATH || require('path').join(require('os').homedir(), '.ipfs')

  logger.info(`[daemon] creating node with repo: ${repoPath}`)
  const ipfsd = await createNode({
    type: 'kubo',
    rpc: create,
    bin: ipfsBin,
    repo: repoPath,
    disposable: false,
    test: false,
    init: false, // Don't auto-init, we handle init manually below
    start: false // Don't auto-start, we handle start manually in startDaemon
  })

  // Checks if the repository is valid to use with IPFS Desktop. If not,
  // we quit the app. We assume that checkRepositoryAndConfiguration
  // presents any dialog explaining the situation.
  if (!checkRepositoryAndConfiguration(ipfsd)) {
    return null
  }

  let isRemote = false

  if (configExists(ipfsd)) {
    migrateConfig(ipfsd)
  } else {
    // If config does not exist, but $IPFS_PATH/api exists
    // then it is a remote repository.
    isRemote = apiFileExists(ipfsd)
    if (!isRemote) {
      // It's a new repository!
      logger.info('[daemon] initializing new repository')
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

/**
 * Check if a process with given PID is still alive.
 * @param {number|undefined} pid
 * @returns {boolean}
 */
function isProcessAlive (pid) {
  if (!pid) return false
  try {
    process.kill(pid, 0)
    return true
  } catch (e) {
    return false
  }
}

/**
 * @typedef {object} IpfsLogs
 * @property {string} logs
 * @property {string|undefined} id
 * @property {any} err
 */

/**
 * Access subprocess streams from ipfsd-ctl KuboNode.
 * The subprocess property is private in TypeScript but accessible at runtime.
 * Provides runtime detection with clear error messages if internal API changes.
 *
 * @param {import('ipfsd-ctl').KuboNode} ipfsd
 * @returns {{ stdout: NodeJS.ReadableStream, stderr: NodeJS.ReadableStream } | null}
 */
function getSubprocessStreams (ipfsd) {
  // @ts-ignore - accessing private property for daemon output monitoring
  if (!('subprocess' in ipfsd)) {
    logger.warn('[daemon] ipfsd-ctl internals changed: ipfsd.subprocess property missing. ' +
      'Migration progress detection disabled. ' +
      'Please report this at https://github.com/ipfs/ipfs-desktop/issues with your ipfsd-ctl version.')
    return null
  }

  // @ts-ignore
  const subprocess = ipfsd.subprocess
  if (!subprocess) {
    // subprocess is null before start() is called, this is expected
    return null
  }

  if (!subprocess.stdout || !subprocess.stderr) {
    logger.warn('[daemon] ipfsd-ctl internals changed: subprocess.stdout/stderr unavailable. ' +
      'Migration progress detection disabled. ' +
      'Please report this at https://github.com/ipfs/ipfs-desktop/issues with your ipfsd-ctl version.')
    return null
  }

  return { stdout: subprocess.stdout, stderr: subprocess.stderr }
}

/**
 * Start IPFS, monitoring stdout/stderr for migrations and errors.
 *
 * @param {import('ipfsd-ctl').KuboNode} ipfsd
 * @param {string[]} flags - daemon flags to pass to start()
 * @returns {Promise<IpfsLogs>}
 */
async function startIpfsWithLogs (ipfsd, flags) {
  let err, id, migrationPrompt
  let logs = ''
  let isMigrating = false
  let isFinished = false
  let cleanupListeners = () => {}

  // ipfsd.start() spawns the process and waits for "daemon is ready"
  // We wrap it to also monitor stdout/stderr for migration progress
  const startPromise = ipfsd.start({ args: flags })

  // Set up output monitoring after start() spawns the subprocess
  // Use setImmediate to let start() create the subprocess first
  setImmediate(() => {
    const streams = getSubprocessStreams(ipfsd)
    if (!streams) return

    const { stdout, stderr } = streams

    const handleOutput = (data) => {
      const str = data.toString()
      logs += str

      const line = str.toLowerCase()
      isMigrating = isMigrating || line.includes('migration')
      isFinished = isFinished || line.includes('daemon is ready')

      // Show migration UI on first migration indicator
      if (isMigrating && !migrationPrompt) {
        logger.info('[daemon] repo migration detected')
        migrationPrompt = showMigrationPrompt(logs, false, false)
      }

      // Update migration UI with progress
      if (migrationPrompt && !isFinished) {
        migrationPrompt.update(logs)
      }
    }

    stdout.on('data', handleOutput)
    stderr.on('data', handleOutput)

    cleanupListeners = () => {
      stdout.removeListener('data', handleOutput)
      stderr.removeListener('data', handleOutput)
    }
  })

  try {
    await startPromise
    const idRes = await ipfsd.api.id()
    id = idRes.id.toString()

    // Verify daemon is actually alive
    const info = await ipfsd.info()
    if (info.pid && !isProcessAlive(info.pid)) {
      throw new Error('IPFS daemon process exited unexpectedly after start')
    }
  } catch (e) {
    err = e
    if (logs.trim().length === 0) {
      logs = e.message || 'ipfs daemon failed to start (see error.log for details)'
    }
    logger.error(`[daemon] startup error: ${logs}`)

    // Show error in migration UI
    if (migrationPrompt) {
      migrationPrompt.loadWindow(logs, true, false)
    } else {
      showMigrationPrompt(logs, true, false)
    }
  } finally {
    cleanupListeners()

    // Close migration prompt on success
    if (!err && migrationPrompt) {
      migrationPrompt.loadWindow('', false, true)
    }
  }

  return { err, id, logs }
}

/**
 * Start the IPFS daemon.
 *
 * @param {any} opts
 * @returns {Promise<{ ipfsd: import('ipfsd-ctl').KuboNode|undefined, weSpawnedDaemon: boolean } & IpfsLogs>}
 */
async function startDaemon (opts) {
  const flags = opts.flags || []
  const ipfsd = await getIpfsd(flags, opts.path)
  if (ipfsd === null) {
    app.quit()
    return { ipfsd: undefined, err: new Error('get ipfsd failed'), id: undefined, logs: '', weSpawnedDaemon: false }
  }

  // Check if api file exists BEFORE starting - if it does, we're connecting
  // to an external daemon (not spawning our own)
  const apiExistedBeforeStart = apiFileExists(ipfsd)

  let { err, logs, id } = await startIpfsWithLogs(ipfsd, flags)
  // We spawned the daemon if api file didn't exist before start
  let weSpawnedDaemon = !apiExistedBeforeStart

  if (err) {
    if (!err.message.includes('ECONNREFUSED') && !err.message.includes('ERR_CONNECTION_REFUSED')) {
      return { ipfsd, err, logs, id, weSpawnedDaemon }
    }

    if (!configExists(ipfsd)) {
      // Try to get API address from info(), fallback to default
      let apiAddr = '/ip4/127.0.0.1/tcp/5001'
      try {
        const info = await ipfsd.info()
        if (info.api) apiAddr = info.api
      } catch (e) {
        // ignore, use default
      }
      dialogs.cannotConnectToApiDialog(apiAddr)
      return { ipfsd, err, logs, id, weSpawnedDaemon }
    }

    // Stale api file from crashed daemon - remove and retry
    logger.info('[daemon] removing api file')
    removeApiFile(ipfsd)

    const errLogs = await startIpfsWithLogs(ipfsd, flags)
    err = errLogs.err
    logs = errLogs.logs
    id = errLogs.id
    // After removing stale api and retrying, we spawned our own daemon
    weSpawnedDaemon = true
  }

  // If we have an error here, it should have been handled by startIpfsWithLogs.
  return { ipfsd, err, logs, id, weSpawnedDaemon }
}

module.exports = startDaemon
