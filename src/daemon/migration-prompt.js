const { BrowserWindow } = require('electron')
const i18n = require('i18next')
const crypto = require('crypto')
const dock = require('../utils/dock')
const { styles, getBackgroundColor } = require('../dialogs/prompt/styles')
const { generateErrorIssueUrl } = require('../dialogs/errors')
const { IS_MAC } = require('../common/consts')

const template = (logs, script, title, message, buttons) => {
  if (IS_MAC) {
    buttons.reverse()
  }

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" /> 
    <title>${title}</title>
  </head>
  <body>
    <p>${message}</p>
    <pre id="logs">${logs}</pre>
    <div id="buttons">
      ${buttons.join('\n')}
    </div>
  </body>
  <style>
  ${styles}
  pre {
    height: 350px;
    background: black;
    color: white;
    overflow-y: auto;
    overflow-x: hidden;
    overflow-anchor: none;
    white-space: break-spaces;
    padding: 10px;
  }
  </style>
  <script>
    function scrollToBottom (id) {
      const el = document.getElementById(id);
      el.scrollTop = el.scrollHeight - el.clientHeight;
    }

    scrollToBottom('logs')

    ${script}
  </script>
</html>`
}

const inProgressTemplate = (logs, id, done) => {
  const title = i18n.t('migrationDialog.title')
  const message = done ? i18n.t('ipfsIsRunning') : i18n.t('migrationDialog.message')
  const buttons = [`<button class="default" onclick="javascript:window.close()">${done ? i18n.t('close') : i18n.t('migrationDialog.closeAndContinue')}</button>`]
  const script = `const { ipcRenderer } = require('electron')

  ipcRenderer.on('${id}', (event, logs) => {
    document.getElementById('logs').innerText = logs
    scrollToBottom('logs')
  })`
  return template(logs, script, title, message, buttons)
}

const errorTemplate = (logs) => {
  const title = i18n.t('startupFailedDialog.title')
  const message = i18n.t('startupFailedDialog.message')
  const buttons = [
    `<button class="default" onclick="javascript:window.close()">${i18n.t('close')}</button>`,
    `<button onclick="javascript:openIssue()">${i18n.t('reportTheError')}</button>`
  ]

  const script = `
  const { shell } = require('electron')

  function openIssue () {
    shell.openExternal('${generateErrorIssueUrl(new Error(logs))}')
  }
  `
  return template(logs, script, title, message, buttons)
}

let window

/**
 * @typedef {object} MigrationPrompt
 * @property {(logs: string) => boolean} update
 * @property {(logs: string, error: boolean, done: boolean) => void} loadWindow
 */

/**
 * Show migration prompt.
 *
 * @param {string} logs
 * @param {boolean} error
 * @param {boolean} done
 * @returns {MigrationPrompt}
 */
function showMigrationPrompt (logs, error = false, done = false) {
  // Generate random id
  const id = crypto.randomBytes(16).toString('hex')

  const loadWindow = (logs, error = false, done = false) => {
    if (!window) {
      window = new BrowserWindow({
        show: false,
        width: 800,
        height: 438,
        useContentSize: true,
        resizable: false,
        autoHideMenuBar: true,
        fullscreenable: false,
        backgroundColor: getBackgroundColor(),
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        }
      })
      window.on('close', () => {
        dock.hide()
        window = null
      })
      window.once('ready-to-show', () => {
        dock.show()
        window.show()
      })
    }
    const page = error ? errorTemplate(logs) : inProgressTemplate(logs, id, done)
    const data = `data:text/html;base64,${Buffer.from(page, 'utf8').toString('base64')}`
    window.loadURL(data)
  }

  loadWindow(logs, error, done)

  return {
    update: logs => {
      if (window) {
        window.webContents.send(id, logs)
        return true
      }
      return false
    },
    loadWindow
  }
}

module.exports = showMigrationPrompt
