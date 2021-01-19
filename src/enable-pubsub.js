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
        logger.info('[pubsub] enabled')
      } else {
        disable()
        logger.info('[pubsub] disabled')
      }

      return true
    } catch (err) {
      logger.error(`[pubsub] ${err.toString()}`)

      return false
    }
  }

  createToggler(CONFIG_KEY, activate)
}

module.exports.CONFIG_KEY = CONFIG_KEY
