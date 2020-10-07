const { shell } = require('electron')
const { autoUpdater } = require('electron-updater')
const i18n = require('i18next')
const logger = require('../common/logger')
const { notify } = require('../common/notify')
const { showDialog } = require('../dialogs')
const quitAndInstall = require('./quit-and-install')

let feedback = false

function setup (ctx) {
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
    logger.info('[updater] update available, download will start')

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
    logger.info('[updater] update downloaded')

    const doIt = () => {
      setImmediate(() => {
        quitAndInstall(ctx)
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
        i18n.t('updateDownloadedDialog.action')
      ]
    })

    doIt()
  })
}

async function checkForUpdates () {
  try {
    await autoUpdater.checkForUpdates()
  } catch (_) {
    // Ignore. The errors are already handled on 'error' event.
  }
}

module.exports = async function (ctx) {
  if (process.env.NODE_ENV === 'development') {
    ctx.checkForUpdates = () => {
      showDialog({
        title: 'Not available in development',
        message: 'Yes, you called this function successfully.',
        buttons: [i18n.t('close')]
      })
    }

    return
  }

  setup(ctx)

  await checkForUpdates()
  setInterval(checkForUpdates, 43200000) // every 12 hours

  ctx.checkForUpdates = () => {
    feedback = true
    checkForUpdates()
  }
}
