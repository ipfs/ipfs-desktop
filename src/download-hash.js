import path from 'path'
import fs from 'fs-extra'
import i18n from 'i18next'
import { clipboard, app, shell, dialog } from 'electron'
import logger from './common/logger'
import { IS_MAC } from './common/consts'
import { notify, notifyError } from './common/notify'
import setupGlobalShortcut from './setup-global-shortcut'

const CONFIG_KEY = 'downloadHashShortcut'

export const SHORTCUT = IS_MAC
  ? 'Command+Control+H'
  : 'CommandOrControl+Alt+D'

async function selectDirectory () {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Select a directory',
    defaultPath: app.getPath('downloads'),
    properties: [
      'openDirectory',
      'createDirectory'
    ]
  })

  if (canceled || filePaths.length === 0) {
    return
  }

  return filePaths[0]
}

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

  const dir = await selectDirectory(ctx)

  if (!dir) {
    logger.info(`[hash download] dropping hash ${text}: user didn't choose a path.`)
    return
  }

  let files

  try {
    logger.info(`[hash download] downloading ${text}: started`)
    files = await ipfsd.api.get(text)
    logger.info(`[hash download] downloading ${text}: completed`)
  } catch (e) {
    logger.error(e.stack)

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
  } catch (e) {
    logger.error(e.stack)

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
