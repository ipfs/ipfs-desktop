const { styles } = require('./styles')

module.exports = ({ message, defaultValue, buttons, id }) => (`<!DOCTYPE html>
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
  ${styles}
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
