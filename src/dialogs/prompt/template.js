module.exports = ({ pallette, message, defaultValue, buttons, id }) => (`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" /> 
  </head>
  <body>
    <p>${message}</p>
    <input type="text" value="${defaultValue}" />
    <div id="buttons">${buttons.join('\n')}</div>
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
  #buttons {
    text-align: right;
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
  </style>
  <script>
    const { ipcRenderer } = require('electron')

    for (const button of document.querySelectorAll('button')) {
      button.addEventListener('click', event => {
        ipcRenderer.send('${id}', {
          input: document.querySelector('input').value,
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
</html>`)
