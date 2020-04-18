const which = require('which')
const i18n = require('i18next')
const pkg = require('./package')
const logger = require('../common/logger')
const store = require('../common/store')
const { showDialog } = require('../dialogs')
const createToggler = require('../utils/create-toggler')

const CONFIG_KEY = 'experiments.npmOnIpfs'

module.exports = function (ctx) {
  // Every 12 hours, check if `ipfs-npm` is installed and, if it is,
  // tries to update it to the latest version.
  setInterval(existsAndUpdate, 43200000)

  // Configure toggler
  createToggler(CONFIG_KEY, toggle)

  // When running for the first time, update the config to know if `ipfs-npm`
  // is installed or not.
  if (store.get(CONFIG_KEY, null) === null) {
    const exists = isPkgInstalled()
    logger.info(`[npm on ipfs] 1st time running and package is ${exists ? 'installed' : 'not installed'}`)
    store.set(CONFIG_KEY, exists)
  }
}

module.exports.CONFIG_KEY = CONFIG_KEY

function isPkgInstalled () {
  return !!which.sync('ipfs-npm', { nothrow: true })
}

function existsAndUpdate () {
  if (isPkgInstalled()) {
    pkg.update()
  } else {
    store.set(CONFIG_KEY, false)
  }
}

async function toggle ({ newValue, oldValue }) {
  if (newValue === oldValue || oldValue === null) {
    return true
  }

  // If the user is telling to (un)install even though they have (un)installed
  // ipfs-npm package manually.
  const manual = isPkgInstalled() === newValue

  if (!newValue) {
    return manual || pkg.uninstall()
  }

  const opt = showDialog({
    type: 'warning',
    title: i18n.t('installNpmOnIpfsWarning.title'),
    message: i18n.t('installNpmOnIpfsWarning.message'),
    buttons: [
      i18n.t('installNpmOnIpfsWarning.action'),
      i18n.t('cancel')
    ]
  })

  if (opt !== 0) {
    // User canceled
    return
  }

  return manual || pkg.install()
}
