import { autoUpdater } from 'electron-updater'
import { logger, i18n, notify, notifyError } from '../utils'

autoUpdater.allowPrerelease = true
autoUpdater.autoDownload = false

function updateError (error) {
  logger.error(error)
  notifyError({
    title: 'Error',
    body: error.stack
  })
}

autoUpdater.on('error', updateError)

autoUpdater.on('update-available', async info => {
  notify({
    title: 'Update Available',
    body: `Version ${info.version} of IPFS Desktop is available. It will be downloaded in background.`
  })

  try {
    await autoUpdater.downloadUpdate()
  } catch (error) {
    updateError(error)
  }
})

autoUpdater.on('update-downloaded', () => {
  notify({
    title: 'Update Downloaded'
  })
  // autoUpdater.quitAndInstall()
})

export default async function () {
  try {
    await autoUpdater.checkForUpdates()
  } catch (error) {
    notifyError({
      title: 'Error',
      body: error.stack
    })
  }
}
