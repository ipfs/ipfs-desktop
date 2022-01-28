const { styles } = require('./styles')

module.exports = ({ message, inputs, buttons, id }) => (`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" /> 
  </head>
  <body>
    <p>${message}</p>
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
</html>`)
