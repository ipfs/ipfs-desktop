const createToggler = require('./utils/create-toggler')
const logger = require('./common/logger')
const store = require('./common/store')
const { AUTO_GARBAGE_COLLECTOR: CONFIG_KEY } = require('./common/config-keys')
const { ipcMain } = require('electron')
const ipcMainEvents = require('./common/ipc-main-events')

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
  ipcMain.emit(ipcMainEvents.IPFS_CONFIG_CHANGED) // trigger node restart
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
