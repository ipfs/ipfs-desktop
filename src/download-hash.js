const path = require('path')
const fs = require('fs-extra')
const i18n = require('i18next')
const { clipboard, app, shell } = require('electron')
const logger = require('./common/logger')
const { IS_MAC } = require('./common/consts')
const { notify, notifyError } = require('./common/notify')
const setupGlobalShortcut = require('./setup-global-shortcut')
const { selectDirectory } = require('./dialogs')
const dock = require('./dock')

const CONFIG_KEY = 'downloadHashShortcut'

const SHORTCUT = IS_MAC
  ? 'Command+Control+H'
  : 'CommandOrControl+Alt+D'

async function saveFile (dir, file) {
  const location = path.join(dir, file.path)
  await fs.outputFile(location, file.content)
}

async function downloadHash (ctx) {
  const { getIpfsd } = ctx
  let text = clipboard.readText().trim()
  const ipfsd = await getIpfsd()

  if (!ipfsd || !text) {
    return
  }

  try {
    text = await ipfsd.api.resolve(text)
  } catch (_) {
    notify({
      title: i18n.t('cantDownloadHash'),
      body: i18n.t('invalidHashClipboard')
    })

    return
  }

  const dir = await dock.run(() => selectDirectory({
    defaultPath: app.getPath('downloads')
  }))

  if (!dir) {
    logger.info(`[hash download] dropping hash ${text}: user didn't choose a path.`)
    return
  }

  let files

  try {
    logger.info(`[hash download] downloading ${text}: started`, { withAnalytics: 'DOWNLOAD_HASH' })
    files = await ipfsd.api.get(text)
    logger.info(`[hash download] downloading ${text}: completed`)
  } catch (err) {
    logger.error(`[hash download] ${err.toString()}`)

    notifyError({
      title: i18n.t('cantDownloadHash'),
      body: i18n.t('errorWhileDownloadingHash')
    })
  }

  try {
    await Promise.all(
      files
        .filter(file => !!file.content)
        .map(file => saveFile(dir, file))
    )

    notify({
      title: i18n.t('hashDownloaded'),
      body: i18n.t('hashDownloadedClickToView', { hash: text })
    }, () => {
      shell.showItemInFolder(path.join(dir, files[0].path))
    })
  } catch (err) {
    logger.error(`[hash download] ${err.toString()}`)

    notifyError({
      title: i18n.t('cantDownloadHash'),
      body: i18n.t('errorWhileWritingFiles')
    })
  }
}

module.exports = function (ctx) {
  setupGlobalShortcut(ctx, {
    settingsOption: CONFIG_KEY,
    accelerator: SHORTCUT,
    action: () => {
      downloadHash(ctx)
    }
  })
}

module.exports.downloadHash = downloadHash
module.exports.SHORTCUT = SHORTCUT
module.exports.CONFIG_KEY = CONFIG_KEY
