import { autoUpdater } from 'electron-updater'
import i18n from 'i18next'
import quitAndInstall from './quit-and-install'
import logger from '../common/logger'
import { notify } from '../common/notify'

let userRequested = false

function setup (ctx) {
  autoUpdater.autoDownload = false

  autoUpdater.on('error', (err) => {
    if (userRequested) {
      userRequested = false
      notify({
        title: i18n.t('couldNotCheckForUpdates'),
        body: i18n.t('pleaseCheckInternet')
      })
    }

    logger.error(`[updater] ${err.toString()}`)
  })

  autoUpdater.on('update-available', async () => {
    logger.info('[updater] update available. download started')

    try {
      await autoUpdater.downloadUpdate()
    } catch (err) {
      logger.error(`[updater] ${err.toString()}`)
    }
  })

  autoUpdater.on('update-not-available', async () => {
    if (userRequested) {
      userRequested = false
      notify({
        title: i18n.t('updateNotAvailable'),
        body: i18n.t('runningLatestVersion')
      })
    }
  })

  autoUpdater.on('update-downloaded', () => {
    logger.info('[updater] update downloaded')

    notify({
      title: i18n.t('updateAvailable'),
      body: i18n.t('clickToInstall')
    }, () => {
      setImmediate(() => {
        quitAndInstall(ctx)
      })
    })
  })
}

async function checkForUpdates () {
  try {
    await autoUpdater.checkForUpdates()
  } catch (_) {
    // Ignore. The errors are already handled on 'error' event.
  }
}

export default async function (ctx) {
  if (process.env.NODE_ENV === 'development') {
    ctx.checkForUpdates = () => {
      notify({
        title: 'DEV Check for Updates',
        body: 'Yes, you called this function successfully.'
      })
    }

    return
  }

  setup(ctx)

  await checkForUpdates()
  setInterval(checkForUpdates, 43200000) // every 12 hours

  ctx.checkForUpdates = () => {
    userRequested = true
    checkForUpdates()
  }
}
