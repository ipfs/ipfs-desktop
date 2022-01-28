const { BrowserWindow, ipcMain } = require('electron')
const crypto = require('crypto')
const { IS_MAC } = require('../../common/consts')
const dock = require('../../utils/dock')
const makePage = require('./template')
const { getBackgroundColor } = require('./styles')

function makeButtons (buttons) {
  buttons = buttons.map((txt, i) => `<button ${i === 0 ? 'class="default"' : ''} id="${i}">${txt}</button>`)

  if (IS_MAC) {
    buttons.reverse()
  }

  return buttons.join('\n')
}

function makeInputs (inputs) {
  return inputs.map(({ type, name, label, defaultValue, labels = {} }) => {
    let str = '<div>'

    switch (type) {
      case 'checkbox':
        str += '<div class="inline">'
        str += `<input type="checkbox" name="${name}" id="${name}" ${defaultValue} />`
        str += `<label for="${name}">${label}</label>`
        str += '</div>'
        break
      case 'radio':
        str += '<div class="group">'
        for (const key in labels) {
          str += '<div class="inline">'
          str += `<input type="radio" name="${name}" id="${key}" value="${key}" ${defaultValue === key ? 'checked' : ''} />`
          str += `<label for="${key}">${labels[key]}</label>`
          str += '</div>'
        }
        str += '</div>'

        break
      case 'text':
        str += `<input type="text" name="${name}" id="${name}" value="${defaultValue}" />`
    }

    str += '</div>'
    return str
  }).join('\n')
}

function generatePage ({ message, inputs, defaultValue = '', buttons }, id) {
  buttons = makeButtons(buttons)
  inputs = makeInputs(inputs)

  const page = makePage({ message, inputs, defaultValue, buttons, id })
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
    backgroundColor: getBackgroundColor(),
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
