const { shell, app, BrowserWindow, Notification } = require('electron')
const { autoUpdater } = require('electron-updater')
const i18n = require('i18next')
const { ipcMain } = require('electron')
const logger = require('../common/logger')
const { showDialog } = require('../dialogs')
const { IS_MAC, IS_WIN, IS_APPIMAGE } = require('../common/consts')
const ipcMainEvents = require('../common/ipc-main-events')
const getCtx = require('../context')
const store = require('../common/store')
const CONFIG_KEYS = require('../common/config-keys')

function isAutoUpdateSupported () {
  if (store.get(CONFIG_KEYS.DISABLE_AUTO_UPDATE, false)) {
    logger.info('[updater] auto update explicitly disabled, not checking for updates automatically')
    return false
  }
  // atm only macOS, windows and AppImage builds support autoupdate mechanism,
  // everything else needs to be updated manually or via a third-party package manager
  return IS_MAC || IS_WIN || IS_APPIMAGE
}

let updateNotification = null // must be a global to avoid gc
let feedback = false

function setup () {
  const ctx = getCtx()
  // we download manually in 'update-available'
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.logger = logger

  autoUpdater.on('error', err => {
    logger.error(`[updater] error: ${err.message}`)
    if (err.stack) {
      logger.error(`[updater] stack: ${err.stack}`)
    }

    // Show dialog for all errors (background and manual checks)
    const opt = showDialog({
      title: i18n.t('autoUpdateError.title'),
      message: i18n.t('autoUpdateError.message'),
      type: 'error',
      buttons: [
        i18n.t('autoUpdateError.later'),
        i18n.t('autoUpdateError.downloadNow')
      ]
    })

    if (opt === 1) {
      shell.openExternal('https://github.com/ipfs/ipfs-desktop/releases/latest')
    }

    if (!feedback) {
      return
    }

    feedback = false
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

  let progressPercentTimeout = null
  autoUpdater.on('download-progress', ({ percent, bytesPerSecond }) => {
    const logDownloadProgress = () => {
      logger.info(`[updater] download progress is ${percent.toFixed(2)}% at ${bytesPerSecond} bps.`)
    }
    // log the percent, but not too often to avoid spamming the logs, but we should
    // be sure we're logging at what percent any hiccup is occurring.
    clearTimeout(progressPercentTimeout)
    if (percent === 100) {
      logDownloadProgress()
      return
    }
    progressPercentTimeout = setTimeout(logDownloadProgress, 2000)
  })

  autoUpdater.on('update-downloaded', ({ version }) => {
    logger.info(`[updater] update to ${version} downloaded`)

    const feedbackDialog = () => {
      const opt = showDialog({
        title: i18n.t('updateDownloadedDialog.title'),
        message: i18n.t('updateDownloadedDialog.message', { version }),
        type: 'info',
        buttons: [
          i18n.t('updateDownloadedDialog.later'),
          i18n.t('updateDownloadedDialog.now')
        ]
      })
      if (opt === 1) { // now
        setImmediate(async () => {
          await beforeQuitCleanup() // just to be sure (we had regressions before)
          autoUpdater.quitAndInstall()
        })
      }
    }
    if (feedback) {
      feedback = false
      // when in instant feedback mode, show dialog immediately
      feedbackDialog()
    } else {
      // show unobtrusive notification + dialog on click
      updateNotification = new Notification({
        title: i18n.t('updateDownloadedNotification.title'),
        body: i18n.t('updateDownloadedNotification.message', { version })
      })
      updateNotification.on('click', feedbackDialog)
      updateNotification.show()
    }
  })
  const stopIpfs = ctx.getFn('stopIpfs')

  // In some cases before-quit event is not emitted before all windows are closed,
  // and we need to do cleanup here
  const beforeQuitCleanup = async () => {
    BrowserWindow.getAllWindows().forEach(w => w.removeAllListeners('close'))
    app.removeAllListeners('window-all-closed')
    try {
      const s = await stopIpfs()
      logger.info(`[beforeQuitCleanup] stopIpfs had finished with status: ${s}`)
    } catch (err) {
      logger.error('[beforeQuitCleanup] stopIpfs had an error', err)
    }
  }
  // built-in updater != electron-updater
  // Added in https://github.com/electron-userland/electron-builder/pull/6395
  require('electron').autoUpdater.on('before-quit-for-update', beforeQuitCleanup)
}

async function checkForUpdates () {
  logger.info('[updater] checking for updates')
  ipcMain.emit(ipcMainEvents.UPDATING)
  try {
    await autoUpdater.checkForUpdates()
  } catch (_) {
    // Ignore. The errors are already handled on 'error' event.
  }
  ipcMain.emit(ipcMainEvents.UPDATING_ENDED)
}

module.exports = async function () {
  if (['test', 'development'].includes(process.env.NODE_ENV ?? '')) {
    getCtx().setProp('manualCheckForUpdates', () => {
      showDialog({
        title: 'Not available in development',
        message: 'Yes, you called this function successfully.',
        buttons: [i18n.t('close')]
      })
    })
    return
  }
  if (!isAutoUpdateSupported()) {
    getCtx().setProp('manualCheckForUpdates', () => {
      shell.openExternal('https://github.com/ipfs/ipfs-desktop/releases/latest')
    })
    return
  }

  setup()

  checkForUpdates() // background check

  setInterval(checkForUpdates, 43200000) // every 12 hours

  // enable on-demand check via About submenu
  getCtx().setProp('manualCheckForUpdates', () => {
    feedback = true
    checkForUpdates()
  })
}
