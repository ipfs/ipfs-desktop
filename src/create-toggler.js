const { ipcMain } = require('electron')
const store = require('./common/store')
const logger = require('./common/logger')

module.exports = function (settingsOption, activate) {
  ipcMain.on(`toggle_${settingsOption}`, async () => {
    const oldValue = store.get(settingsOption, null)
    const newValue = !oldValue

    // TODO: refactor: tell the user if didn't work or not available.
    // Receive prompt() to ask user if they're sure they want to enable for some.

    if (await activate(newValue, oldValue)) {
      store.set(settingsOption, newValue)

      const action = newValue ? 'enabled' : 'disabled'
      logger.info(`[${settingsOption}] ${action}`)
    }

    ipcMain.emit('configUpdated')
  })
}
