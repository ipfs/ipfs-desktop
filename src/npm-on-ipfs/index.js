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

// Deprecated in February 2021. Remove soon.
module.exports = function (ctx = require('../context')) {
  if (store.get(CONFIG_KEY, null) === true) {
    logger.info('[npm on ipfs] deprecated, removing')
    store.delete(CONFIG_KEY)
    uninstall()

    showDialog({
      title: 'NPM on IPFS Uninstalled',
      message: 'NPM on IPFS via IPFS Desktop has been deprecated since February 2021. It was now fully removed. As an alternative, you can use https://github.com/foragepm/forage.',
      buttons: [i18n.t('close')]
    })
  }
}

module.exports.CONFIG_KEY = CONFIG_KEY

function isPkgInstalled () {
  return !!which.sync('ipfs-npm', { nothrow: true })
}

async function uninstall () {
  if (isPkgInstalled() === false) {
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
