import path from 'path'
import fs from 'fs-extra'
import i18n from 'i18next'
import { clipboard, app, shell } from 'electron'
import logger from './common/logger'
import { IS_MAC } from './common/consts'
import { notify, notifyError } from './common/notify'
import setupGlobalShortcut from './setup-global-shortcut'
import { selectDirectory } from './dialogs'
import dock from './dock'

const CONFIG_KEY = 'downloadHashShortcut'

export const SHORTCUT = IS_MAC
  ? 'Command+Control+H'
  : 'CommandOrControl+Alt+D'

async function saveFile (dir, file) {
  const location = path.join(dir, file.path)
  await fs.outputFile(location, file.content)
}

export async function downloadHash (ctx) {
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

export default function (ctx) {
  setupGlobalShortcut(ctx, {
    settingsOption: CONFIG_KEY,
    accelerator: SHORTCUT,
    action: () => {
      downloadHash(ctx)
    }
  })
}
