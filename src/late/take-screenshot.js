import { clipboard, ipcMain, globalShortcut, nativeImage } from 'electron'
import i18n from 'i18next'
import { store, notify, notifyError, logger } from '../utils'
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

async function onSucess (ipfs, launchWebUI, path, img) {
  const stats = await ipfs.files.stat(path)
  const url = `https://share.ipfs.io/#/${stats.hash}`
  clipboard.writeText(url)

  notify({
    title: i18n.t('screenshotTaken'),
    body: i18n.t('shareableLinkCopied'),
    icon: img.resize({
      width: 200,
      quality: 'good'
    })
  }, () => {
    launchWebUI(`/files${path}`)
  })
}

function onError (e) {
  logger.error(e)

  notifyError({
    title: i18n.t('couldNotTakeScreenshot'),
    body: i18n.t('errorwhileTakingScreenshot')
  })
}

function handleScreenshot (ctx) {
  let { getIpfsd, launchWebUI } = ctx

  return async (_, output) => {
    const ipfsd = await getIpfsd()

    if (!ipfsd) {
      return
    }

    const ipfs = ipfsd.api

    if (!ipfs) {
      logger.info('[screenshot] daemon not running')
      return
    }

    try {
      await makeScreenshotDir(ipfs)
      const isDir = output.length > 1
      const rawDate = new Date()
      const date = `${rawDate.getFullYear()}-${rawDate.getMonth()}-${rawDate.getDate()}`
      const time = `${rawDate.getHours()}.${rawDate.getMinutes()}.${rawDate.getMilliseconds()}`
      let baseName = `/screenshots/${date} ${time}`

      if (isDir) {
        baseName += '/'
        await ipfs.files.mkdir(baseName)
      } else {
        baseName += '.png'
      }

      logger.info('[screenshot] started: writing screenshots to %s', baseName)
      let lastImage = null

      for (let { name, image } of output) {
        const img = nativeImage.createFromDataURL(image)
        const path = isDir ? `${baseName}${name}.png` : baseName
        await ipfs.files.write(path, img.toPNG(), { create: true })
        lastImage = img
      }

      logger.info('[screenshot] completed: writing screenshots to %s', baseName)
      onSucess(ipfs, launchWebUI, baseName, lastImage)
    } catch (e) {
      onError(e)
    }
  }
}

export default function (ctx) {
  let { webui } = ctx

  let activate = (value, oldValue) => {
    if (value === oldValue) return

    if (value === true) {
      globalShortcut.register(shortcut, () => {
        logger.info('[screenshot] taking screenshot')
        webui.webContents.send('screenshot')
      })

      logger.info('[screenshot] shortcut enabled')
    } else {
      globalShortcut.unregister(shortcut)
      logger.info('[screenshot] shortcut disabled')
    }

    return true
  }

  activate(store.get(settingsOption, false))
  createToggler(ctx, settingsOption, activate)
  ipcMain.on('screenshot', handleScreenshot(ctx))
}
