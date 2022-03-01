const Ctl = require('ipfsd-ctl')
const i18n = require('i18next')
const { showDialog } = require('../dialogs')
const logger = require('../common/logger')
const { getCustomBinary } = require('../custom-ipfs-binary')
const { applyDefaults, migrateConfig, checkCorsConfig, checkPorts, configExists, rmApiFile, apiFileExists } = require('./config')
const showMigrationPrompt = require('./migration-prompt')

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

function getIpfsBinPath () {
  return process.env.IPFS_GO_EXEC ||
    getCustomBinary() ||
    require('go-ipfs')
      .path()
      .replace('app.asar', 'app.asar.unpacked')
}

async function spawn ({ flags, path }) {
  const ipfsBin = getIpfsBinPath()

  const ipfsd = await Ctl.createController({
    ipfsHttpModule: require('ipfs-http-client'),
    ipfsBin,
    ipfsOptions: {
      repo: path
    },
    remote: false,
    disposable: false,
    test: false,
    args: flags
  })

  if (configExists(ipfsd)) {
    migrateConfig(ipfsd)
    checkCorsConfig(ipfsd)
    return { ipfsd, isRemote: false }
  }

  // If config does not exist, but $IPFS_PATH/api exists, then
  // it is a remote repository.
  if (apiFileExists(ipfsd)) {
    return { ipfsd, isRemote: true }
  }

  await ipfsd.init()

  applyDefaults(ipfsd)
  return { ipfsd, isRemote: false }
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

async function startIpfsWithLogs (ipfsd) {
  let err, id, migrationPrompt
  let isMigrating, isErrored
  let logs = ''

  const stopListening = listenToIpfsLogs(ipfsd, data => {
    logs += data.toString()

    isMigrating = isMigrating || logs.toLowerCase().includes('migration')
    isErrored = isErrored || logs.toLowerCase().includes('error')

    if (!isMigrating) {
      return
    }

    if (!migrationPrompt) {
      logger.info('[daemon] ipfs data store is migrating')
      migrationPrompt = showMigrationPrompt(logs, isErrored)
      return
    }

    if (isErrored) { // forced show on error (even if user closed window to run in background)
      migrationPrompt.updateShow(logs, isErrored)
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
  }

  stopListening()

  if (isErrored) { // save daemon output to error.log
    logger.error(logs)
  }

  return {
    err, id, logs
  }
}

module.exports = async function (opts) {
  const { ipfsd, isRemote } = await spawn(opts)
  if (!isRemote) {
    await checkPorts(ipfsd)
  }

  let errLogs = await startIpfsWithLogs(ipfsd)

  if (errLogs.err) {
    if (!errLogs.err.message.includes('ECONNREFUSED') && !errLogs.err.message.includes('ERR_CONNECTION_REFUSED')) {
      return { ipfsd, err: errLogs.err, logs: errLogs.logs }
    }

    if (!configExists(ipfsd)) {
      cannotConnectDialog(ipfsd.apiAddr.toString())
      return { ipfsd, err: errLogs.err, logs: errLogs.logs }
    }

    logger.info('[daemon] removing api file')
    rmApiFile(ipfsd)

    errLogs = await startIpfsWithLogs(ipfsd)
  }

  return { ipfsd, err: errLogs.err, logs: errLogs.logs, id: errLogs.id }
}
