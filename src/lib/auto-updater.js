import { autoUpdater } from 'electron-updater'
import { logger, i18n, notify, logo } from '../utils'

let userRequested = false

function setup () {
  autoUpdater.allowPrerelease = true
  autoUpdater.autoDownload = false

  autoUpdater.on('error', (err) => {
    if (userRequested) {
      userRequested = false
      notify({
        title: i18n.t('couldNotCheckForUpdates'),
        body: i18n.t('pleaseCheckInternet'),
        icon: logo('black')
      })
    }

    logger.error(err)
  })

  autoUpdater.on('update-available', async () => {
    logger.info(`[updater] update available. download started`)

    try {
      await autoUpdater.downloadUpdate()
    } catch (error) {
      logger.error(error)
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
    logger.info(`[updater] update downloaded`)

    notify({
      title: i18n.t('updateAvailable'),
      body: i18n.t('clickToInstall')
    }, () => {
      autoUpdater.quitAndInstall(true, true)
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

  setup()

  await checkForUpdates()
  setInterval(checkForUpdates, 3600000) // every hour

  ctx.checkForUpdates = () => {
    userRequested = true
    checkForUpdates()
  }
}
