const { shell, app, BrowserWindow, Notification } = require('electron')
const { autoUpdater } = require('electron-updater')
const i18n = require('i18next')
const { ipcMain } = require('electron')
const logger = require('../common/logger')
const { showDialog } = require('../dialogs')
const { IS_MAC, IS_WIN, IS_APPIMAGE } = require('../common/consts')
const ipcMainEvents = require('../common/ipc-main-events')

function isAutoUpdateSupported () {
  // atm only macOS, windows and AppImage builds support autoupdate mechanism,
  // everything else needs to be updated manually or via a third-party package manager
  return IS_MAC || IS_WIN || IS_APPIMAGE
}

let updateNotification = null // must be a global to avoid gc
let feedback = false

function setup (ctx) {
  // we download manually in 'update-available'
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

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
      // when in instant feedback mode, show dialog immediatelly
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

  // In some cases before-quit event is not emitted before all windows are closed,
  // and we need to do cleanup here
  const beforeQuitCleanup = async () => {
    BrowserWindow.getAllWindows().forEach(w => w.removeAllListeners('close'))
    app.removeAllListeners('window-all-closed')
    try {
      const s = await ctx.stopIpfs()
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
  ipcMain.emit(ipcMainEvents.UPDATING)
  try {
    await autoUpdater.checkForUpdates()
  } catch (_) {
    // Ignore. The errors are already handled on 'error' event.
  }
  ipcMain.emit(ipcMainEvents.UPDATING_ENDED)
}

module.exports = async function (ctx) {
  if (['test', 'development'].includes(process.env.NODE_ENV)) {
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
