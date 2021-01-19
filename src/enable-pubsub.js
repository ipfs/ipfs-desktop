const createToggler = require('./utils/create-toggler')
const logger = require('./common/logger')
const store = require('./common/store')
const { ipcMain } = require('electron')

const CONFIG_KEY = 'pubsub'
const pubsubFlag = '--enable-pubsub-experiment'

function enable () {
  let flags = store.get('ipfsConfig.flags', [])
  flags = flags.filter(item => item !== pubsubFlag) // avoid duplication when user has one added manually
  flags.push(pubsubFlag)
  applyConfig(flags)
}

function disable () {
  let flags = store.get('ipfsConfig.flags', [])
  flags = flags.filter(item => item !== pubsubFlag) // remove flag
  applyConfig(flags)
}

function applyConfig (newFlags) {
  const flags = store.get('ipfsConfig.flags', [])
  if (flags.length !== newFlags.length) {
    store.set('ipfsConfig.flags', newFlags)
    ipcMain.emit('ipfsConfigChanged') // trigger node restart
  }
}

module.exports = async function () {
  const activate = ({ newValue, oldValue }) => {
    if (newValue === oldValue) return

    try {
      if (newValue === true) {
        enable()
      } else {
        disable()
      }

      return true
    } catch (err) {
      logger.error(`[pubsub] ${err.toString()}`)

      return false
    }
  }
  activate({ newValue: store.get(CONFIG_KEY, false) })
  createToggler(CONFIG_KEY, activate)
  logger.info(`[pubsub] ${store.get(CONFIG_KEY, false) ? 'enabled' : 'disabled'}`)
}

module.exports.CONFIG_KEY = CONFIG_KEY
