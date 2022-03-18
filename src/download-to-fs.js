const { join } = require('path')
const fs = require('fs-extra')
const { clipboard, app, shell } = require('electron')
const i18n = require('i18next')
const isIPFS = require('is-ipfs')
const toIterable = require('stream-to-it')
const pipe = require('it-pipe')
const logger = require('./common/logger')
const setupGlobalShortcut = require('./utils/setup-global-shortcut')
const dock = require('./utils/dock')
const { IS_MAC } = require('./common/consts')
const { showDialog, showPrompt, selectDirectory } = require('./dialogs')

const CONFIG_KEY = 'downloadHashShortcut'

const SHORTCUT = IS_MAC
  ? 'Command+Control+H'
  : 'CommandOrControl+Alt+D'

async function getCidOrPath () {
  const text = clipboard.readText().trim()

  const { button, input } = await showPrompt({
    title: i18n.t('downloadCidContentDialog.title'),
    message: i18n.t('downloadCidContentDialog.message'),
    defaultValue: (isIPFS.cid(text) || isIPFS.path(text)) ? text : '',
    buttons: [
      i18n.t('downloadCidContentDialog.action'),
      i18n.t('cancel')
    ],
    window: {
      width: 500,
      height: 120
    }
  })

  if (button !== 0) {
    return
  }

  return input
}

async function downloadToFs ({ getIpfsd }) {
  const cidOrPath = await getCidOrPath()
  if (!cidOrPath) {
    logger.info('[download] canceled: user did not choose a cid or path')
    return
  }

  const ipfsd = await getIpfsd()
  if (!ipfsd) {
    return
  }

  let ipfsPath
  try {
    ipfsPath = await ipfsd.api.resolve(cidOrPath)
  } catch (_) {
    showDialog({
      title: i18n.t('cantResolveCidDialog.title'),
      message: i18n.t('cantResolveCidDialog.message', { path: cidOrPath }),
      buttons: [i18n.t('close')]
    })

    return
  }

  const dir = await dock.run(() => selectDirectory({ defaultPath: app.getPath('downloads') }))
  if (!dir) {
    logger.info('[download] canceled: user did not choose a directory')
    return
  }

  const cid = ipfsPath.split('/').pop()
  const filename = join(dir, `${cid}.tar`)

  try {
    logger.info(`[download] writing ${ipfsPath} to ${filename}: started`, { withAnalytics: 'DOWNLOAD_HASH' })
    const sink = toIterable.sink(fs.createWriteStream(filename))
    const source = ipfsd.api.get(ipfsPath)
    await pipe(source, sink)
    logger.info(`[download] writing ${ipfsPath}: completed`)
  } catch (err) {
    logger.error(`[download] ${err.stack}`)

    const errMsg = err.toString()
    logger.error(`[download] ${errMsg}`)

    showDialog({
      title: i18n.t('couldNotSaveDialog.title'),
      message: i18n.t('couldNotSaveDialog.message', { dir, error: errMsg }),
      buttons: [i18n.t('close')]
    })
  }

  const opt = showDialog({
    title: i18n.t('contentsSavedDialog.title'),
    message: i18n.t('contentsSavedDialog.message', { path: filename }),
    buttons: [
      i18n.t('contentsSavedDialog.action'),
      i18n.t('close')
    ]
  })

  if (opt === 0) {
    shell.showItemInFolder(filename)
  }
}

module.exports = function (ctx) {
  setupGlobalShortcut({
    confirmationDialog: {
      title: i18n.t('enableGlobalDownloadShortcut.title'),
      message: i18n.t('enableGlobalDownloadShortcut.message', { accelerator: SHORTCUT })
    },
    settingsOption: CONFIG_KEY,
    accelerator: SHORTCUT,
    action: () => {
      downloadToFs(ctx)
    }
  })
}

module.exports.downloadToFs = downloadToFs
module.exports.SHORTCUT = SHORTCUT
module.exports.CONFIG_KEY = CONFIG_KEY
