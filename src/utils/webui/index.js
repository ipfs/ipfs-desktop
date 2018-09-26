import { logo, logger } from '../'
import { join } from 'path'
import { BrowserWindow } from 'electron'

export default function (apiAddress = '/ip4/127.0.0.1', url = '/') {
  const window = new BrowserWindow({
    title: 'IPFS Desktop',
    icon: logo('ice'),
    show: false,
    autoHideMenuBar: true,
    minWidth: 1100,
    height: 690,
    webPreferences: {
      preload: join(__dirname, 'preload.js')
    }
  })

  // Only show the window when the contents have finished loading.
  window.on('ready-to-show', () => {
    window.show()
    window.focus()
    logger.info('WebUI window ready')
  })

  window.loadURL(`https://webui.ipfs.io?api=${apiAddress}#${url}`)

  window.once('close', () => {
    logger.info('WebUI screen was closed')
  })
}
