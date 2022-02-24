const i18n = require('i18next')
const { BrowserWindow, nativeTheme } = require('electron')
const dock = require('../utils/dock')

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

const template = (logs) => (`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" /> 
  </head>
  <body>
    <p>${i18n.t('migrationDialog.message')}</p>
    <pre id="logs">${logs}</pre>
    <div id="buttons">
      <button class="default" onclick="javascript:window.close()">${i18n.t('migrationDialog.closeAndContinue')}</button>
    </div>
  </body>
  <style>
  :root {
    --background: ${pallette.default.background};
    --color: ${pallette.default.color};
    --input-background: ${pallette.default.inputBackground};
    --default-background: ${pallette.default.defaultBackground};
  }
  * {
    box-sizing: border-box;
  }
  body, html {
    margin: 0;
    padding: 0;
    font-size: 14px;
    overflow: hidden;
  }
  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-family: system-ui;
    line-height: 1;
    padding: 0.75rem;
    color: var(--color);
    background: var(--background);
  }
  p, input, button {
    font-size: 1rem;
  }
  p {
    margin: 0;
  }
  input, button {
    border-radius: 0.2rem;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: var(--input-background);
    color: var(--color);
  }
  input {
    display: block;
    width: 100%;
    margin: 0.5rem 0;
    padding: 0.15rem;
    outline: 0;
  }
  button {
    margin-left: 0.5rem;
    padding: 0.25rem 0.5rem;
    font-size: 1rem;
    outline: 0;
    cursor: pointer;
  }
  button.default {
    background: var(--default-background);
    color: #ffffff;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --background: ${pallette.dark.background};
      --color: ${pallette.dark.color};
      --input-background: ${pallette.dark.inputBackground};
      --default-background: ${pallette.dark.defaultBackground};
    }
  }
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

    ipcRenderer.on('logs', (event, logs) => {
      document.getElementById('logs').innerText = logs
      scrollToBottom('logs')
    })
  </script>
</html>`)

module.exports = (logs) => {
  let window = new BrowserWindow({
    title: i18n.t('migrationDialog.title'),
    show: false,
    width: 800,
    height: 438,
    useContentSize: true,
    resizable: false,
    autoHideMenuBar: true,
    fullscreenable: false,
    backgroundColor: nativeTheme.shouldUseDarkColors
      ? pallette.dark.background
      : pallette.default.background,
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

  const page = template(logs)
  const data = `data:text/html;base64,${Buffer.from(page, 'utf8').toString('base64')}`

  window.loadURL(data)

  return logs => {
    if (window) window.webContents.send('logs', logs)
  }
}
