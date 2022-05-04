const which = require('which')
const util = require('util')
const i18n = require('i18next')
const logger = require('../common/logger')
const store = require('../common/store')
const { showDialog } = require('../dialogs')
const { IS_WIN } = require('../common/consts')
const childProcess = require('child_process')

const execFile = util.promisify(childProcess.execFile)
const npmBin = IS_WIN ? 'npm.cmd' : 'npm'

const CONFIG_KEY = 'experiments.npmOnIpfs'

/**
 * Deprecated in February 2021. Remove soon.
 *
 * @deprecated
 * @param {Awaited<import('../context')>} ctx
 */
module.exports = async function (ctx) {
  if (store.get(CONFIG_KEY, null) === true) {
    logger.info('[npm on ipfs] deprecated, removing')
    store.delete(CONFIG_KEY)
    await uninstall()

    showDialog({
      title: 'NPM on IPFS Uninstalled',
      message: 'NPM on IPFS via IPFS Desktop has been deprecated since February 2021. It was now fully removed. As an alternative, you can use https://github.com/foragepm/forage.',
      buttons: [i18n.t('close')]
    })
  }
}

module.exports.CONFIG_KEY = CONFIG_KEY

async function isPkgInstalled () {
  const ifpsNpmCmdPath = await which('ipfs-npm', { nothrow: true })
  return ifpsNpmCmdPath === true
}

async function uninstall () {
  if (await isPkgInstalled()) {
    return
  }

  try {
    await execFile(npmBin, ['uninstall', '-g', 'ipfs-npm'])
    logger.info('[npm on ipfs] ipfs-npm: uninstalled globally')
    return true
  } catch (err) {
    logger.error(`[npm on ipfs] ipfs-npm failed to uninstall: ${err.toString()}`, err)
  }
}
