const { IS_MAC, IPFS_LOGO_URI } = require('../../common/consts')
const { styles } = require('./styles')

/**
 * Generates an HTML string with the given button labels.
 * The order of the buttons is inverted on macOS to match the behavior
 * of the OS.
 *
 * @param {string[]} labels
 * @returns {string}
 */
function getButtonComponentsHtml (labels) {
  const buttons = labels.map((txt, i) => `<button ${i === 0 ? 'class="default"' : ''} id="${i}">${txt}</button>`)

  if (IS_MAC) {
    buttons.reverse()
  }

  return buttons.join('\n')
}

/**
 * @typedef InputConfiguration
 * @type {object}
 * @property {string} type
 * @property {string} name
 * @property {string} defaultValue
 * @property {string | null} label
 * @property {string[] | null} labels
 */

/**
 * Generates an HTML string with the given configurations.
 *
 * @param {InputConfiguration[]} inputs
 * @returns {string}
 */
function getInputComponentsHtml (inputs) {
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

/**
 * Generates a base64 encoded URI with the HTML content of a prompt window.
 *
 * @param {PromptConfiguration} config
 * @param {string} id
 * @returns {string}
 */
function getPromptEncodedHtml (config, id) {
  const buttons = getButtonComponentsHtml(config.buttons)
  const inputs = getInputComponentsHtml(config.inputs)

  const html = `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
    </head>
    <body>
      <img src="${IPFS_LOGO_URI}" id="logo">
      <p>${config.message}</p>
      <form>
        ${inputs}
        <div id="buttons">${buttons}</div>
      </form>
    </body>
    <style>
    ${styles}
    </style>
    <script>
      const { ipcRenderer } = require('electron')

      for (const button of document.querySelectorAll('button')) {
        button.addEventListener('click', event => {
          ipcRenderer.send('${id}', {
            input: Object.fromEntries(new FormData(document.querySelector('form')).entries()),
            button: Number(button.id)
          })
        })
      }

      document.querySelector('input').addEventListener('keypress', (event) => {
        if (event.code === 'Enter') {
          event.preventDefault()
          document.querySelector('button.default').click()
        }
      })
    </script>
  </html>`

  return `data:text/html;base64,${Buffer.from(html, 'utf8').toString('base64')}`
}

module.exports = {
  getPromptEncodedHtml
}
