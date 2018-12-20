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

function handleScreenshot (ctx) {
  let { ipfsd } = ctx

  return async (_, output) => {
    const ipfs = ipfsd.api

    if (!ipfs) {
      logger.info('Daemon not running. Aborting screenshot upload.')
      return
    }

    try {
      await makeScreenshotDir(ipfs)
    } catch (e) {
      logger.error(e.stack)
      return
    }

    for (let { name, image } of output) {
      logger.info('Screenshot taken to %s', name)
      let base64Data = image.replace(/^data:image\/png;base64,/, '')
      name = name === 'Entire screen' ? '' : `-${name}`

      const path = `/screenshots/${new Date().toISOString()}${name}.png`
      const content = Buffer.from(base64Data, 'base64')

      try {
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
}

export default function (ctx) {
  let { sendToMenubar } = ctx

  let activate = (value, oldValue) => {
    if (value === oldValue) return

    if (value === true) {
      globalShortcut.register(shortcut, () => {
        logger.info('Taking Screenshot')
        sendToMenubar('screenshot')
      })

      logger.info('Screenshot shortcut enabled')
    } else {
      globalShortcut.unregister(shortcut)
      logger.info('Screenshot shortcut disabled')
    }
  }

  activate(store.get(settingsOption, false))
  createToggler(ctx, settingsOption, activate)
  ipcMain.on('screenshot', handleScreenshot(ctx))
}
