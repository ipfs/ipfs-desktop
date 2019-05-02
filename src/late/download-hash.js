import path from 'path'
import fs from 'fs-extra'
import isIPFS from 'is-ipfs'
import i18n from 'i18next'
import { clipboard, app, shell, dialog, globalShortcut } from 'electron'
import { store, logger, notify, notifyError } from '../utils'
import { createToggler } from './utils'

const settingsOption = 'downloadHashShortcut'
const shortcut = 'CommandOrControl+Alt+D'

function validateIPFS (text) {
  return isIPFS.multihash(text) ||
    isIPFS.cid(text) ||
    isIPFS.ipfsPath(text) ||
    isIPFS.ipfsPath(`/ipfs/${text}`)
}

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
  logger.info(`[hash download] '${file.path}' downloaded to ${location}.`)
}

function handler (ctx) {
  const { getIpfsd } = ctx

  return async () => {
    const text = clipboard.readText().trim()
    const ipfsd = await getIpfsd()

    if (!ipfsd || !text) {
      return
    }

    if (!validateIPFS(text)) {
      notify({
        title: i18n.t('cantDownloadHash'),
        body: i18n.t('invalidHashProvided')
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
      if (files.length > 1) {
        files.splice(0, 1)
      }

      await Promise.all(files.map(file => saveFile(dir, file)))

      notify({
        title: i18n.t('hashDownloaded'),
        body: i18n.t('hashDownloadedClickToView', { hash: text })
      }, () => {
        shell.showItemInFolder(path.join(dir, text))
      })
    } catch (e) {
      logger.error(e.stack)

      notifyError({
        title: i18n.t('cantDownloadHash'),
        body: i18n.t('errorWhileWritingFiles')
      })
    }
  }
}

export default function (ctx) {
  let activate = (value, oldValue) => {
    if (value === oldValue) return

    if (value === true) {
      globalShortcut.register(shortcut, handler(ctx))
      logger.info('[hash download] shortcut enabled')
    } else {
      globalShortcut.unregister(shortcut)
      logger.info('[hash download] shortcut disabled')
    }

    return true
  }

  activate(store.get(settingsOption, false))
  createToggler(ctx, settingsOption, activate)
}
