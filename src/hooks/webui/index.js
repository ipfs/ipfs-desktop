import { logo, logger, store } from '../../utils'
import { join } from 'path'
import { screen, BrowserWindow, ipcMain } from 'electron'
import serve from 'electron-serve'

serve({ scheme: 'webui', directory: `${__dirname}/app` })

const createWindow = () => {
  const dimensions = screen.getPrimaryDisplay()

  const window = new BrowserWindow({
    title: 'IPFS Desktop',
    icon: logo('ice'),
    show: false,
    autoHideMenuBar: true,
    width: store.get('window.width', dimensions.width < 1440 ? dimensions.width : 1440),
    height: store.get('window.height', dimensions.height < 900 ? dimensions.height : 900),
    webPreferences: {
      preload: join(__dirname, 'preload.js')
    }
  })

  window.on('resize', () => {
    const dim = window.getSize()
    store.set('window.width', dim[0])
    store.set('window.height', dim[1])
  })

  window.on('close', (event) => {
    event.preventDefault()
    window.hide()
    logger.info('WebUI screen was hidden')
  })

  return window
}

export default async function (ctx) {
  // const apiAddress = ctx.ipfsd.apiAddr
  const window = createWindow()
  ctx.webUiWindow = window

  ipcMain.on('launchWebUI', (_, url) => {
    window.webContents.send('updatedPage', url)
    window.show()
    window.focus()
  })

  ipcMain.on('app.quit', () => {
    // Makes sure the app quits even though we prevent
    // the closing of this window.
    window.destroy()
  })

  ipcMain.on('config.get', () => {
    window.webContents.send('config.changed', store.store)
  })

  return new Promise(resolve => {
    window.on('ready-to-show', () => {
      logger.info('WebUI window ready')
      resolve()
    })

    window.loadURL(`http://localhost:3000/`)
    // window.loadURL(`webui://-?api=${apiAddress}#/`)
  })
}
