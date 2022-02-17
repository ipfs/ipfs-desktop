const Ctl = require('ipfsd-ctl')
const i18n = require('i18next')
const { showDialog } = require('../dialogs')
const logger = require('../common/logger')
const { applyDefaults, migrateConfig, checkCorsConfig, checkPorts, configExists, rmApiFile, apiFileExists } = require('./config')
const { getCustomBinary } = require('../custom-ipfs-binary')

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

function getIpfsLogs (ipfsd, callback) {
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
  }, 100)

  const stop = () => {
    stdout.removeListener('data', listener)
    stderr.removeListener('data', listener)
  }

  return stop
}

module.exports = async function (opts) {
  const { ipfsd, isRemote } = await spawn(opts)
  if (!isRemote) await checkPorts(ipfsd)

  const stopListening = getIpfsLogs(ipfsd, console.log)
  setTimeout(stopListening, 2000)

  try {
    await ipfsd.start()
    const { id } = await ipfsd.api.id()
    logger.info(`[daemon] PeerID is ${id}`)
    logger.info(`[daemon] Repo is at ${ipfsd.path}`)
  } catch (err) {
    if (!err.message.includes('ECONNREFUSED') && !err.message.includes('ERR_CONNECTION_REFUSED')) {
      throw err
    }

    if (!configExists(ipfsd)) {
      cannotConnectDialog(ipfsd.apiAddr.toString())
      throw err
    }

    logger.info('[daemon] removing api file')
    rmApiFile(ipfsd)
    await ipfsd.start()
  }

  return ipfsd
}
