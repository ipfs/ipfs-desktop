const { BrowserWindow, ipcMain, nativeTheme } = require('electron')
const crypto = require('crypto')
const { IS_MAC } = require('../../common/consts')
const dock = require('../../utils/dock')
const makePage = require('./template')

const pallette = {
  default: {
    background: '#ECECEC',
    color: '#262626',
    inputBackground: '#ffffff',
    defaultBackground: '#007AFF'
  },
  dark: {
    background: '#323232',
    color: '#ffffff',
    inputBackground: '#656565',
    defaultBackground: '#0A84FF'
  }
}

function generatePage ({ message, defaultValue = '', buttons }, id) {
  buttons = buttons.map((txt, i) => `<button ${i === 0 ? 'class="default"' : ''} id="${i}">${txt}</button>`)

  if (IS_MAC) {
    buttons.reverse()
  }

  const page = makePage({ pallette, message, defaultValue, buttons, id })
  return `data:text/html;base64,${Buffer.from(page, 'utf8').toString('base64')}`
}

module.exports = async function showPrompt (options) {
  options = Object.assign({}, {
    window: {},
    showDock: true
  }, options)

  const window = new BrowserWindow({
    title: options.title,
    show: false,
    width: 350,
    height: 330,
    resizable: false,
    autoHideMenuBar: true,
    fullscreenable: false,
    backgroundColor: nativeTheme.shouldUseDarkColors
      ? pallette.dark.background
      : pallette.default.background,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    ...options.window
  })

  // Generate random id
  const id = crypto.randomBytes(16).toString('hex')

  return new Promise(resolve => {
    ipcMain.once(id, (_, data) => {
      window.destroy()
      if (options.showDock) dock.hide()
      resolve(data)
    })

    window.on('close', () => {
      if (options.showDock) dock.hide()
      resolve({ input: '', button: null })
    })

    window.once('ready-to-show', () => {
      if (options.showDock) dock.show()
      window.show()
    })

    window.loadURL(generatePage(options, id))
  })
}
