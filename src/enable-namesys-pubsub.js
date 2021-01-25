const createToggler = require('./utils/create-toggler')
const logger = require('./common/logger')
const store = require('./common/store')
const { ipcMain } = require('electron')

const CONFIG_KEY = 'experiments.pubsubNamesys'
const namesysPubsubFlag = '--enable-namesys-pubsub'
const isEnabled = flags => flags.some(f => f === namesysPubsubFlag)

function enable () {
  const flags = store.get('ipfsConfig.flags', [])
  if (!isEnabled(flags)) {
    flags.push(namesysPubsubFlag)
    applyConfig(flags)
  }
}

function disable () {
  let flags = store.get('ipfsConfig.flags', [])
  if (isEnabled(flags)) {
    flags = flags.filter(item => item !== namesysPubsubFlag) // remove flag
    applyConfig(flags)
  }
}

function applyConfig (newFlags) {
  store.set('ipfsConfig.flags', newFlags)
  ipcMain.emit('ipfsConfigChanged') // trigger node restart
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
      logger.error(`[ipns over pubsub] ${err.toString()}`)

      return false
    }
  }
  activate({ newValue: store.get(CONFIG_KEY, false) })
  createToggler(CONFIG_KEY, activate)
  logger.info(`[ipns over pubsub] ${store.get(CONFIG_KEY, false) ? 'enabled' : 'disabled'}`)
}

module.exports.CONFIG_KEY = CONFIG_KEY
