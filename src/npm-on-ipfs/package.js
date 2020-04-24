const util = require('util')
const i18n = require('i18next')
const logger = require('../common/logger')
const { IS_WIN } = require('../common/consts')
const { recoverableErrorDialog } = require('../dialogs')
const childProcess = require('child_process')

const execFile = util.promisify(childProcess.execFile)
const npmBin = IS_WIN ? 'npm.cmd' : 'npm'

async function update () {
  try {
    logger.info('[npm on ipfs] ipfs-npm: checking if outdated')

    // NOTE: might fail on older NPM (< 6.9.1) versions
    // https://github.com/npm/cli/pull/173
    const { stdout } = await execFile(npmBin, ['outdated', '-g'])

    if (stdout.indexOf('ipfs-npm') === -1) {
      logger.info('[npm on ipfs] ipfs-npm: is up to date')
      return
    }
  } catch (e) {
    logger.error(`[npm on ipfs] ipfs-npm: could not check if up to date ${e.toString()}`)
  }

  logger.info('[npm on ipfs] ipfs-npm: is out to date, will update')
  install()
}

async function install () {
  try {
    await execFile(npmBin, ['install', '-g', 'ipfs-npm'])
    logger.info('[npm on ipfs] ipfs-npm: installed globally')
    return true
  } catch (err) {
    logger.error(`[npm on ipfs] ${err.toString()}`)
    recoverableErrorDialog(err, {
      title: i18n.t('unableToInstallNpmOnIpfs.title'),
      message: i18n.t('unableToInstallNpmOnIpfs.message')
    })
    return false
  }
}

async function uninstall () {
  try {
    await execFile(npmBin, ['uninstall', '-g', 'ipfs-npm'])
    logger.info('[npm on ipfs] ipfs-npm: uninstalled globally')
    return true
  } catch (err) {
    logger.error(`[npm on ipfs] ${err.toString()}`)
    recoverableErrorDialog(err, {
      title: i18n.t('unableToUninstallNpmOnIpfs.title'),
      message: i18n.t('unableToUninstallNpmOnIpfs.message')
    })
    return false
  }
}

module.exports = Object.freeze({
  update,
  install,
  uninstall
})
