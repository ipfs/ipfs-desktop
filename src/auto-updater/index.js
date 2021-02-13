const { shell } = require('electron')
const { autoUpdater } = require('electron-updater')
const i18n = require('i18next')
const { ipcMain } = require('electron')
const logger = require('../common/logger')
const { notify } = require('../common/notify')
const { showDialog } = require('../dialogs')
const macQuitAndInstall = require('./macos-quit-and-install')
const { IS_MAC, IS_WIN, IS_APPIMAGE } = require('../common/consts')

function isAutoUpdateSupported () {
  // atm only macOS, windows and AppImage builds support autoupdate mechanism,
  // everything else needs to be updated manually or via a third-party package manager
  return IS_MAC || IS_WIN || IS_APPIMAGE
}

let feedback = false

function setup (ctx) {
  // we download manually in 'update-available'
  autoUpdater.autoDownload = false

  // mac requires manual upgrade, other platforms work out of the box
  autoUpdater.autoInstallOnAppQuit = !IS_MAC

  autoUpdater.on('error', err => {
    logger.error(`[updater] ${err.toString()}`)

    if (!feedback) {
      return
    }

    feedback = false
    showDialog({
      title: i18n.t('updateErrorDialog.title'),
      message: i18n.t('updateErrorDialog.message'),
      type: 'error',
      buttons: [
        i18n.t('close')
      ]
    })
  })

  autoUpdater.on('update-available', async ({ version, releaseNotes }) => {
    logger.info(`[updater] update to ${version} available, download will start`)

    try {
      await autoUpdater.downloadUpdate()
    } catch (err) {
      logger.error(`[updater] ${err.toString()}`)
    }

    if (!feedback) {
      return
    }

    // do not toggle feedback off here so we can show a dialog once the download
    // is finished.

    const opt = showDialog({
      title: i18n.t('updateAvailableDialog.title'),
      message: i18n.t('updateAvailableDialog.message', { version, releaseNotes }),
      type: 'info',
      buttons: [
        i18n.t('close'),
        i18n.t('readReleaseNotes')
      ]
    })

    if (opt === 1) {
      shell.openExternal(`https://github.com/ipfs-shipyard/ipfs-desktop/releases/v${version}`)
    }
  })

  autoUpdater.on('update-not-available', ({ version }) => {
    logger.info('[updater] update not available')

    if (!feedback) {
      return
    }

    feedback = false
    showDialog({
      title: i18n.t('updateNotAvailableDialog.title'),
      message: i18n.t('updateNotAvailableDialog.message', { version }),
      type: 'info',
      buttons: [
        i18n.t('close')
      ]
    })
  })

  autoUpdater.on('update-downloaded', ({ version }) => {
    logger.info(`[updater] update to ${version} downloaded`)

    const { autoInstallOnAppQuit } = autoUpdater
    const doIt = () => {
      // Do nothing if install is handled by upstream logic
      if (autoInstallOnAppQuit) return
      // Else, do custom install handling
      setImmediate(() => {
        if (IS_MAC) macQuitAndInstall(ctx)
      })
    }

    if (!feedback) {
      notify({
        title: i18n.t('updateDownloadedNotification.title'),
        body: i18n.t('updateDownloadedNotification.message', { version })
      }, doIt)
    }

    feedback = false

    showDialog({
      title: i18n.t('updateDownloadedDialog.title'),
      message: i18n.t('updateDownloadedDialog.message', { version }),
      type: 'info',
      buttons: [
        (autoInstallOnAppQuit ? i18n.t('ok') : i18n.t('updateDownloadedDialog.action'))
      ]
    })

    doIt()
  })
}

async function checkForUpdates () {
  ipcMain.emit('updating')
  try {
    await autoUpdater.checkForUpdates()
  } catch (_) {
    // Ignore. The errors are already handled on 'error' event.
  }
  ipcMain.emit('updatingEnded')
}

module.exports = async function (ctx) {
  if (process.env.NODE_ENV === 'development') {
    ctx.manualCheckForUpdates = () => {
      showDialog({
        title: 'Not available in development',
        message: 'Yes, you called this function successfully.',
        buttons: [i18n.t('close')]
      })
    }
    return
  }
  if (!isAutoUpdateSupported()) {
    ctx.manualCheckForUpdates = () => {
      shell.openExternal('https://github.com/ipfs-shipyard/ipfs-desktop/releases/latest')
    }
    return
  }

  setup(ctx)

  checkForUpdates() // background check

  setInterval(checkForUpdates, 43200000) // every 12 hours

  // enable on-demand check via About submenu
  ctx.manualCheckForUpdates = () => {
    feedback = true
    checkForUpdates()
  }
}
