import { autoUpdater } from 'electron-updater'
import { logger, i18n, notify, notifyError } from '../utils'

autoUpdater.allowPrerelease = true
autoUpdater.autoDownload = false

function updateError (error) {
  logger.error(error)
  notifyError({
    title: i18n.t('updateError'),
    body: i18n.t('errorWhileUpdating')
  })
}

autoUpdater.on('error', updateError)

autoUpdater.on('update-available', async ({ version }) => {
  notify({
    title: i18n.t('updateAvailable'),
    body: i18n.t('versionAvailableAndDownload', { version })
  })

  try {
    await autoUpdater.downloadUpdate()
  } catch (error) {
    updateError(error)
  }
})

autoUpdater.on('update-downloaded', () => {
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
