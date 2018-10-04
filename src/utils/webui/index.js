import { logo, logger } from '../'
import { join } from 'path'
import { BrowserWindow } from 'electron'
import serve from 'electron-serve'

serve({ scheme: 'webui', directory: `${__dirname}/app` })

export default function (opts = {}) {
  opts.apiAddress = opts.apiAddress || '/ip4/127.0.0.1'
  opts.url = opts.url || '/'

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

  window.loadURL(`webui://-?api=${opts.apiAddress}#${opts.url}`)

  window.once('close', () => {
    logger.info('WebUI screen was closed')
  })
}
