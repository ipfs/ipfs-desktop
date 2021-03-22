const createToggler = require('./utils/create-toggler')
const logger = require('./common/logger')
const store = require('./common/store')
const { ipcMain } = require('electron')

const CONFIG_KEY = 'automaticGC'
const gcFlag = '--enable-gc'
const isEnabled = flags => flags.some(f => f === gcFlag)

function enable () {
  const flags = store.get('ipfsConfig.flags', [])
  if (!isEnabled(flags)) {
    flags.push(gcFlag)
    applyConfig(flags)
  }
}

function disable () {
  let flags = store.get('ipfsConfig.flags', [])
  if (isEnabled(flags)) {
    flags = flags.filter(item => item !== gcFlag) // remove flag
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
      logger.error(`[automatic gc] ${err.toString()}`)

      return false
    }
  }
  activate({ newValue: store.get(CONFIG_KEY, true) })
  createToggler(CONFIG_KEY, activate)
  logger.info(`[automatic gc] ${store.get(CONFIG_KEY, true) ? 'enabled' : 'disabled'}`)
}

module.exports.CONFIG_KEY = CONFIG_KEY
