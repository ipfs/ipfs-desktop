const { clipboard, nativeImage, ipcMain } = require('electron')
const i18n = require('i18next')
const { analyticsKeys } = require('./analytics/keys')
const { SCREENSHOT_SHORTCUT: CONFIG_KEY } = require('./common/config-keys')
const { IS_MAC } = require('./common/consts')
const ipcMainEvents = require('./common/ipc-main-events')
const logger = require('./common/logger')
const { notify, notifyError } = require('./common/notify')
const getCtx = require('./context')
const setupGlobalShortcut = require('./utils/setup-global-shortcut')

const SHORTCUT = IS_MAC
  ? 'Command+Control+S'
  : 'CommandOrControl+Alt+S'

async function makeScreenshotDir (ipfs) {
  try {
    await ipfs.files.stat('/screenshots')
  } catch (_) {
    await ipfs.files.mkdir('/screenshots')
  }
}

async function onSuccess (ipfs, launchWebUI, path, img) {
  // preserve filename if single file is shared
  const filename = path.endsWith('.png') ? `?filename=${encodeURIComponent(path.split('/').pop())}` : ''
  const { cid } = await ipfs.files.stat(path)
  const url = `https://dweb.link/ipfs/${cid}${filename}`
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
  logger.error(`[screenshot] ${e.toString()}`)

  notifyError({
    title: i18n.t('couldNotTakeScreenshot'),
    body: i18n.t('errorwhileTakingScreenshot')
  })
}

function handleScreenshot () {
  const ctx = getCtx()
  const launchWebUI = ctx.getFn('launchWebUI')
  const getIpfsd = ctx.getFn('getIpfsd')
  return async (_, output) => {
    const ipfsd = await getIpfsd()

    if (!ipfsd) {
      return
    }

    // @ts-ignore
    const ipfs = ipfsd.api

    if (!ipfs) {
      logger.info('[screenshot] daemon not running')
      return
    }

    try {
      await makeScreenshotDir(ipfs)
      const isDir = output.length > 1
      const d = new Date()
      const pad = n => String(n).padStart(2, '0')
      const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
      const time = `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getMilliseconds())}`
      let baseName = `/screenshots/${date}_${time}`

      if (isDir) {
        baseName += '/'
        await ipfs.files.mkdir(baseName, { parents: true })
      } else {
        baseName += '.png'
      }

      logger.info(`[screenshot] started: writing screenshots to ${baseName}`, { withAnalytics: analyticsKeys.SCREENSHOT_TAKEN })
      let lastImage = null

      for (const { name, image } of output) {
        const img = nativeImage.createFromDataURL(image)
        const path = isDir ? `${baseName}${name}.png` : baseName
        const { cid } = await ipfs.add(img.toPNG(), { pin: false }) // no low level pin, presence in MFS will be enough to keep it around
        await ipfs.files.cp(cid, path)
        lastImage = img
      }

      logger.info(`[screenshot] completed: writing screenshots to ${baseName}`)
      onSuccess(ipfs, launchWebUI, baseName, lastImage)
    } catch (e) {
      onError(e)
    }
  }
}

async function takeScreenshot () {
  const webui = await getCtx().getProp('webui')
  logger.info('[screenshot] taking screenshot')
  webui.webContents.send('screenshot')
}

module.exports = function () {
  setupGlobalShortcut({
    confirmationDialog: {
      title: i18n.t('enableGlobalTakeScreenshotShortcut.title'),
      message: i18n.t('enableGlobalTakeScreenshotShortcut.message', { accelerator: SHORTCUT })
    },
    settingsOption: CONFIG_KEY,
    accelerator: SHORTCUT,
    action: () => {
      takeScreenshot()
    }
  })

  ipcMain.on(ipcMainEvents.SCREENSHOT, handleScreenshot())
}

module.exports.takeScreenshot = takeScreenshot
module.exports.SHORTCUT = SHORTCUT
