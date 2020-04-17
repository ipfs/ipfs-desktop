const { app, shell } = require('electron')

module.exports = function () {
  app.on('web-contents-created', (_, contents) => {
    contents.on('will-navigate', (event, url) => {
      const parsedUrl = new URL(url)

      if (parsedUrl.origin !== 'webui://-') {
        event.preventDefault()
        shell.openExternal(url)
      }
    })

    contents.on('new-window', (event, url) => {
      event.preventDefault()
      shell.openExternal(url)
    })
  })
}
