const i18n = require('i18next')
const { ipcMain } = require('electron')
const logger = require('./common/logger')
const { showDialog, recoverableErrorDialog } = require('./dialogs')
const dock = require('./utils/dock')
const ipcMainEvents = require('./common/ipc-main-events')
const getCtx = require('./context')

module.exports = function runGarbageCollector ({ getIpfsd }) {
  dock.run(async () => {
    logger.info('[run gc] alerting user for effects')
    const ctx = getCtx()
    const getIpfsd = ctx.getFn('getIpfsd')

    const opt = showDialog({
      title: i18n.t('runGarbageCollectorWarning.title'),
      message: i18n.t('runGarbageCollectorWarning.message'),
      type: 'warning',
      buttons: [
        i18n.t('runGarbageCollectorWarning.action'),
        i18n.t('cancel')
      ],
      showDock: false
    })

    if (opt !== 0) {
      logger.info('[run gc] user canceled')
      return
    }

    const ipfsd = await getIpfsd()

    if (!ipfsd) {
      return
    }

    ipcMain.emit(ipcMainEvents.GC_RUNNING)

    try {
      const errors = []

      for await (const res of ipfsd.api.repo.gc()) {
        if (res instanceof Error) {
          errors.push(res)
        }
      }

      if (errors.length) {
        throw errors
      }

      showDialog({
        title: i18n.t('runGarbageCollectorDone.title'),
        message: i18n.t('runGarbageCollectorDone.message'),
        type: 'info',
        buttons: [
          i18n.t('ok')
        ],
        showDock: false
      })
      logger.info('[run gc] success')
    } catch (err) {
      logger.error(`[run gc] ${err.stack}`)
      recoverableErrorDialog(err, {
        title: i18n.t('runGarbageCollectorErrored.title'),
        message: i18n.t('runGarbageCollectorErrored.message')
      })
    }

    ipcMain.emit(ipcMainEvents.GC_ENDED)
  })
}
