import { logo, logger } from '../utils'
import { BrowserWindow } from 'electron'

// Builds the Welcome window and does magic.
export default function () {
  return new Promise(resolve => {
    // Initialize the welcome window.
    const window = new BrowserWindow({
      title: 'Welcome to IPFS',
      icon: logo('ice'),
      show: false,
      autoHideMenuBar: true,
      width: 850,
      height: 450
    })

    // Only show the window when the contents have finished loading.
    window.on('ready-to-show', () => {
      window.show()
      window.focus()
      logger.info('Welcome window ready')
    })

    // window.setMenu(null)
    window.loadURL(`file://${__dirname}/view.html`)

    window.once('close', () => {
      logger.info('Welcome screen was closed')

      // TODO: if closing through the right button, store.set('seenWelcome', true)

      resolve()
    })
  })
}
