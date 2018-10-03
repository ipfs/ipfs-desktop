import { clipboard, ipcMain, globalShortcut } from 'electron'
import { store, logger } from '../utils'
import { createToggler } from './utils'

const settingsOption = 'screenshotShortcut'
const shortcut = 'CommandOrControl+Alt+S'

async function makeScreenshotDir (ipfs) {
  try {
    await ipfs.files.stat('/screenshots')
  } catch (_) {
    await ipfs.files.mkdir('/screenshots')
  }
}

function handleScreenshot (opts) {
  let { connManager } = opts

  return async (_, image) => {
    const ipfs = connManager.api

    if (!ipfs) {
      logger.info('Daemon not running. Aborting screenshot upload.')
      return
    }

    let base64Data = image.replace(/^data:image\/png;base64,/, '')

    logger.info('Screenshot taken')

    const path = `/screenshots/${new Date().toISOString()}.png`
    const content = Buffer.from(base64Data, 'base64')

    try {
      await makeScreenshotDir(ipfs)
      await ipfs.files.write(path, content, { create: true })

      const stats = await ipfs.files.stat(path)
      const url = `https://ipfs.io/ipfs/${stats.hash}`

      clipboard.writeText(url)
      logger.info('Screenshot uploaded', { path: path })
    } catch (e) {
      logger.error(e.stack)
    }
  }
}

export default function (opts) {
  let { send } = opts

  let activate = (value, oldValue) => {
    if (value === oldValue) return

    if (value === true) {
      globalShortcut.register(shortcut, () => {
        logger.info('Taking Screenshot')
        send('screenshot')
      })

      logger.info('Screenshot shortcut enabled')
    } else {
      globalShortcut.unregister(shortcut)
      logger.info('Screenshot shortcut disabled')
    }
  }

  activate(store.get(settingsOption, false))
  createToggler(opts, 'config.toggleScreenshot', settingsOption, activate)
  ipcMain.on('screenshot', handleScreenshot(opts))
}
