const Ctl = require('ipfsd-ctl')
const i18n = require('i18next')
const fs = require('fs-extra')
const { join } = require('path')
const { app } = require('electron')
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

function writeIpfsBinaryPath (path) {
  fs.outputFileSync(
    join(app.getPath('home'), './.ipfs-desktop/IPFS_EXEC')
      .replace('app.asar', 'app.asar.unpacked'),
    path
  )
}

async function spawn ({ flags, path }) {
  const ipfsBin = getIpfsBinPath()
  writeIpfsBinaryPath(ipfsBin)

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

module.exports = async function (opts) {
  const { ipfsd, isRemote } = await spawn(opts)
  if (!isRemote) await checkPorts(ipfsd)

  try {
    await ipfsd.start()
    const { id } = await ipfsd.api.id()
    logger.info(`[daemon] PeerID is ${id}`)
    logger.info(`[daemon] Repo is at ${ipfsd.path}`)
  } catch (err) {
    if (!err.message.includes('ECONNREFUSED')) {
      throw err
    }

    if (!configExists(ipfsd)) {
      cannotConnectDialog(ipfsd.apiAddr)
      throw err
    }

    logger.info('[daemon] removing api file')
    rmApiFile(ipfsd)
    await ipfsd.start()
  }

  return ipfsd
}
