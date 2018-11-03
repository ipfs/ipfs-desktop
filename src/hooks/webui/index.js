import { logo, logger } from '../../utils'
import { join } from 'path'
import { screen, BrowserWindow, ipcMain } from 'electron'
import serve from 'electron-serve'

serve({ scheme: 'webui', directory: `${__dirname}/app` })

export default async function ({ connManager }) {
  const apiAddress = await connManager.apiAddress()
  const dimensions = screen.getPrimaryDisplay()

  const window = new BrowserWindow({
    title: 'IPFS Desktop',
    icon: logo('ice'),
    show: false,
    autoHideMenuBar: true,
    width: dimensions.width < 1440 ? dimensions.width : 1440,
    height: dimensions.height < 900 ? dimensions.height : 900,
    webPreferences: {
      preload: join(__dirname, 'preload.js')
    }
  })

  window.once('close', (event) => {
    event.preventDefault()
    window.hide()
    logger.info('WebUI screen was hidden')
  })

  ipcMain.on('launchWebUI', (_, url) => {
    if (!window.webContents) return
    window.webContents.send('updatedPage', url)
    window.show()
    window.focus()
  })

  ipcMain.on('app.quit', () => {
    // Makes sure the app quits even though we prevent
    // the closing of this window.
    window.destroy()
  })

  return new Promise(resolve => {
    window.on('ready-to-show', () => {
      logger.info('WebUI window ready')
      resolve()
    })

    window.loadURL(`webui://-?api=${apiAddress}#/`)
  })
}
