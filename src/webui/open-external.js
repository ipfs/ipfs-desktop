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

    // handling external links
    contents.setWindowOpenHandler(({ url }) => {
      // open in external URL handler (user's default web browser)
      shell.openExternal(url)
      // do not open in Electron itself
      return { action: 'deny' }
    })
  })
}
