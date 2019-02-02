import { autoUpdater } from 'electron-updater'
import { logger, i18n, notify } from '../utils'

autoUpdater.allowPrerelease = true
autoUpdater.autoDownload = false

autoUpdater.on('error', logger.error)

autoUpdater.on('update-available', async () => {
  logger.info(`[updater] update available. download started`)

  try {
    await autoUpdater.downloadUpdate()
  } catch (error) {
    logger.error(error)
  }
})

autoUpdater.on('update-downloaded', () => {
  logger.info(`[updater] update downloaded`)

  notify({
    title: i18n.t('updateDownloaded'),
    body: i18n.t('clickToInstall')
  }, () => {
    autoUpdater.quitAndInstall(true, true)
  })
})

export default async function () {
  try {
    await autoUpdater.checkForUpdates()
  } catch (_) {
    // Ignore. The errors are already handled on 'error' event.
  }
}
