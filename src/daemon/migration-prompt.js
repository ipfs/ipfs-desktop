const { BrowserWindow } = require('electron')
const i18n = require('i18next')
const crypto = require('crypto')
const dock = require('../utils/dock')
const { styles, getBackgroundColor } = require('../dialogs/prompt/styles')

const template = (logs, id, message, buttons) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" /> 
  </head>
  <body>
    <p>${message}</p>
    <pre id="logs">${logs}</pre>
    <div id="buttons">
      ${buttons}
    </div>
  </body>
  <style>
  ${styles}
  #buttons {
    text-align: center;
  }
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
    const { ipcRenderer } = require('electron')

    function scrollToBottom (id) {
      const el = document.getElementById(id);
      el.scrollTop = el.scrollHeight - el.clientHeight;
    }

    ${id && `ipcRenderer.on(${id}, (event, logs) => {
      document.getElementById('logs').innerText = logs
      scrollToBottom('logs')
    })`}
  </script>
</html>`

const inProgressTemplate = (logs, id) => {
  const message = i18n.t('migrationDialog.message')
  const buttons = `<button class="default" onclick="javascript:window.close()">${i18n.t('migrationDialog.closeAndContinue')}</button>`
  return template(logs, id, message, buttons)
}

const errorTemplate = (logs) => {
  const message = i18n.t('migrationFailedDialog.message')
  const buttons = `
    <button class="default" onclick="javascript:window.alert('report')">${i18n.t('reportTheError')}</button>
    <button class="default" onclick="javascript:window.close()">${i18n.t('close')}</button>
  `
  return template(logs, null, message, buttons)
}

module.exports = (logs, error = false) => {
  let window = new BrowserWindow({
    title: i18n.t('migrationDialog.title'),
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

  // Generate random id
  const id = crypto.randomBytes(16).toString('hex')

  const loadWindow = (error, logs) => {
    const page = error ? errorTemplate(logs) : inProgressTemplate(logs, id)
    const data = `data:text/html;base64,${Buffer.from(page, 'utf8').toString('base64')}`
    window.loadURL(data)
  }

  loadWindow(error, logs)

  return {
    update: logs => {
      if (window) {
        window.webContents.send(id, logs)
        return true
      }

      return false
    },
    updateShow: (logs, error = false) => {
      loadWindow(logs, error)
    }
  }
}
