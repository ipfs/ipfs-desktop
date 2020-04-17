const which = require('which')
const pkg = require('./package')
const logger = require('../common/logger')
const store = require('../common/store')
const createToggler = require('../create-toggler')

const CONFIG_KEY = 'experiments.npmOnIpfs'

module.exports = function (ctx) {
  let interval = null

  createToggler(CONFIG_KEY, async (value, oldValue) => {
    if (value === oldValue || oldValue === null) return true

    // If the user is telling to (un)install even though they have (un)installed
    // ipfs-npm package manually.
    const manual = isPkgInstalled() === value

    if (value === true) {
      if (!manual && !await pkg.install()) return false
      interval = setInterval(existsAndUpdate, 43200000) // every 12 hours
      return true
    }

    clearInterval(interval)
    return manual || pkg.uninstall()
  })

  let opt = store.get(CONFIG_KEY, null)
  const exists = isPkgInstalled()

  if (opt === null) {
    logger.info(`[npm on ipfs] 1st time running and package is ${exists ? 'installed' : 'not installed'}`)
    store.set(CONFIG_KEY, exists)
    opt = exists
  }

  if (opt === true) {
    logger.info('[npm on ipfs] set to update every 12 hours')
    interval = setInterval(existsAndUpdate, 43200000) // every 12 hours
  } else {
    logger.info('[npm on ipfs] no action taken')
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
