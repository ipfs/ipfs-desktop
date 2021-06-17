const { join, dirname } = require('path')
const fs = require('fs-extra')
const i18n = require('i18next')
const isIPFS = require('is-ipfs')
const all = require('it-all')
const concat = require('it-concat')
const { clipboard, app, shell } = require('electron')
const logger = require('./common/logger')
const { IS_MAC } = require('./common/consts')
const setupGlobalShortcut = require('./utils/setup-global-shortcut')
const dock = require('./utils/dock')
const { showDialog, showPrompt, selectDirectory } = require('./dialogs')

const CONFIG_KEY = 'downloadHashShortcut'

const SHORTCUT = IS_MAC
  ? 'Command+Control+H'
  : 'CommandOrControl+Alt+D'

async function saveFile (dir, file) {
  const destination = join(dir, file.path)
  // ensure files are saved within the dir picked by the user
  if (!destination.startsWith(dir)) {
    throw new Error(`unable to create '${file.path}' outside of '${dir}'`)
  }
  // abort if destination already exists (safer default than overwriting user data)
  if (fs.existsSync(destination)) {
    throw new Error(`unable to create '${file.path}' as it already exists at '${destination}'`)
  }
  // abort if symlinks in the target dir point outside of it
  const subDir = dirname(destination)
  if (fs.existsSync(subDir)) {
    const realRootDir = await fs.realpath(dir)
    const realSubDir = await fs.realpath(subDir)
    if (!realSubDir.startsWith(realRootDir)) {
      throw new Error(`unable to create subdir '${realSubDir}' outside of '${realRootDir}'`)
    }
  }
  await fs.outputFile(destination, file.content)
}

async function get (ipfs, cid) {
  return all((async function * () {
    for await (let { path, content } of ipfs.get(cid)) {
      content = content ? (await concat(content)).toString() : null
      yield { path, content }
    }
  })())
}

async function getCID () {
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

async function downloadCid (ctx) {
  const cid = await getCID()
  if (!cid) {
    logger.info('[cid download] user canceled')
    return
  }

  const { getIpfsd } = ctx
  const ipfsd = await getIpfsd()

  if (!ipfsd) {
    return
  }

  let path
  try {
    path = await ipfsd.api.resolve(cid)
  } catch (_) {
    showDialog({
      title: i18n.t('cantResolveCidDialog.title'),
      message: i18n.t('cantResolveCidDialog.message', { path: cid }),
      buttons: [i18n.t('close')]
    })

    return
  }

  const dir = await dock.run(() => selectDirectory({
    defaultPath: app.getPath('downloads')
  }))

  if (!dir) {
    logger.info(`[cid download] dropping ${path}: user didn't choose a path.`)
    return
  }

  let files

  try {
    logger.info(`[cid download] downloading ${path}: started`, { withAnalytics: 'DOWNLOAD_HASH' })
    files = await get(ipfsd.api, path)
    logger.info(`[cid download] downloading ${path}: completed`)
  } catch (err) {
    logger.error(`[cid download] ${err.stack}`)

    showDialog({
      title: i18n.t('couldNotGetCidDialog.title'),
      message: i18n.t('couldNotGetCidDialog.message', { path }),
      buttons: [i18n.t('close')]
    })

    return
  }

  try {
    await Promise.all(
      files
        .filter(file => !!file.content)
        .map(file => saveFile(dir, file))
    )

    const opt = showDialog({
      title: i18n.t('contentsSavedDialog.title'),
      message: i18n.t('contentsSavedDialog.message', { path }),
      buttons: [
        i18n.t('contentsSavedDialog.action'),
        i18n.t('close')
      ]
    })

    if (opt === 0) {
      shell.showItemInFolder(join(dir, files[0].path))
    }
  } catch (err) {
    const errMsg = err.toString()
    logger.error(`[cid download] ${errMsg}`)

    showDialog({
      title: i18n.t('couldNotSaveDialog.title'),
      message: i18n.t('couldNotSaveDialog.message', { dir, error: errMsg }),
      buttons: [i18n.t('close')]
    })
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
      downloadCid(ctx)
    }
  })
}

module.exports.downloadCid = downloadCid
module.exports.SHORTCUT = SHORTCUT
module.exports.CONFIG_KEY = CONFIG_KEY
