const { BrowserWindow, ipcMain } = require('electron')
const crypto = require('crypto')

const dock = require('../../utils/dock')
const { getBackgroundColor } = require('./styles')
const { getPromptEncodedHtml } = require('./html')

/**
 * @typedef PromptConfiguration
 * @type {object}
 * @property {string} title
 * @property {string} message
 * @property {InputConfiguration[]} inputs
 * @property {string[]} buttons
 * @property {object} window
 */

/**
 * Displays a prompt to the user according to the given configuration.
 *
 * @param {PromptConfiguration} config
 * @returns
 */
module.exports = async function showPrompt (config) {
  config = Object.assign({}, {
    window: {},
    showDock: true
  }, config)

  const window = new BrowserWindow({
    title: config.title,
    show: false,
    width: 350,
    height: 330,
    useContentSize: true,
    resizable: false,
    autoHideMenuBar: true,
    fullscreenable: false,
    backgroundColor: getBackgroundColor(),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    ...config.window
  })

  // Generate random id
  const id = crypto.randomBytes(16).toString('hex')

  return new Promise(resolve => {
    ipcMain.once(id, (_, data) => {
      window.destroy()
      if (config.showDock) dock.hide()
      resolve(data)
    })

    window.on('close', () => {
      if (config.showDock) dock.hide()
      resolve({ input: '', button: null })
    })

    window.once('ready-to-show', () => {
      if (config.showDock) dock.show()
      window.show()
    })

    window.loadURL(getPromptEncodedHtml(config, id))
  })
}
