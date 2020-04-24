const { ipcMain } = require('electron')
const store = require('../common/store')
const logger = require('../common/logger')

module.exports = function (settingsOption, activate) {
  ipcMain.on(`toggle_${settingsOption}`, async () => {
    const oldValue = store.get(settingsOption, null)
    const newValue = !oldValue

    if (await activate({ newValue, oldValue, feedback: true })) {
      store.set(settingsOption, newValue)

      const action = newValue ? 'enabled' : 'disabled'
      logger.info(`[${settingsOption}] ${action}`)
    }

    // We always emit the event so any handlers for it can act upon
    // the current configuration, whether it was successfully
    // updated or not.
    ipcMain.emit('configUpdated')
  })
}
