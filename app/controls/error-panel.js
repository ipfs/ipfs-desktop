import BrowserWindow from 'browser-window'
import config from './../config'

export default function errorPanel (err) {
  const errorWindow = new BrowserWindow(config.window)

  errorWindow.loadUrl(config.urls.help)

  errorWindow.webContents.on('did-finish-load', () => {
    errorWindow.webContents.send('err', err.toString())
  })
}
