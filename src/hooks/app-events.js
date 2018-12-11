import { app, shell, session } from 'electron'

export default function () {
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

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({ // eslint-disable-line
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['default-src \'none\'']
      }
    })
  })
}
