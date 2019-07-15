import path from 'path'
import os from 'os'
import fs from 'fs-extra'
import i18n from 'i18next'
import { clipboard, app, shell, dialog } from 'electron'
import { logger, notify, notifyError, setupGlobalShortcut } from '../utils'

const settingsOption = 'downloadHashShortcut'

export const SHORTCUT = os.platform() === 'darwin'
  ? 'Command+Control+H'
  : 'CommandOrControl+Alt+D'

function selectDirectory () {
  return new Promise(resolve => {
    dialog.showOpenDialog({
      title: 'Select a directory',
      defaultPath: app.getPath('downloads'),
      properties: [
        'openDirectory',
        'createDirectory'
      ]
    }, (res) => {
      if (!res || res.length === 0) {
        resolve()
      } else {
        resolve(res[0])
      }
    })
  })
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
    settingsOption,
    accelerator: SHORTCUT,
    action: () => {
      downloadHash(ctx)
    }
  })
}
