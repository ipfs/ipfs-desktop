const createToggler = require('./utils/create-toggler.js')
const logger = require('./common/logger.js')
const store = require('./common/store.js')
const { EXPERIMENT_PUBSUB_NAMESYS: CONFIG_KEY } = require('./common/config-keys.js')
const { ipcMain } = require('electron')
const ipcMainEvents = require('./common/ipc-main-events.js')

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
  store.safeSet('ipfsConfig.flags', newFlags, () => {
    ipcMain.emit(ipcMainEvents.IPFS_CONFIG_CHANGED) // trigger node restart
  })
}

const defaultExport = async function () {
  const activate = ({ newValue, oldValue = null }) => {
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

module.exports = defaultExport
