const { ipcMain } = require('electron')
const ipcMainEvents = require('../common/ipc-main-events')
const logger = require('../common/logger')
const store = require('../common/store')

module.exports = function (settingsOption, activate) {
  ipcMain.on(ipcMainEvents.TOGGLE(settingsOption), async () => {
    const oldValue = store.get(settingsOption, null)
    const newValue = !oldValue

    if (await activate({ newValue, oldValue, feedback: true })) {
      store.safeSet(settingsOption, newValue, () => {
        const action = newValue ? 'enabled' : 'disabled'
        logger.info(`[${settingsOption}] ${action}`)
      })
    }

    // We always emit the event so any handlers for it can act upon
    // the current configuration, whether it was successfully
    // updated or not.
    ipcMain.emit(ipcMainEvents.CONFIG_UPDATED)
  })
}
