const { ipcMain } = require('electron')
const i18n = require('i18next')
const ipcMainEvents = require('./common/ipc-main-events')
const logger = require('./common/logger')
const getCtx = require('./context')
const { showDialog, recoverableErrorDialog } = require('./dialogs')
const dock = require('./utils/dock')

module.exports = function runGarbageCollector () {
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

    const ipfsd = /** @type {(optional?: boolean) => Promise<any>} */(await getIpfsd())

    if (!ipfsd) {
      return
    }

    ipcMain.emit(ipcMainEvents.GC_RUNNING)

    try {
      const errors = []

      // @ts-ignore
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
      logger.error(`[run gc] ${err}`)
      recoverableErrorDialog(err, {
        title: i18n.t('runGarbageCollectorErrored.title'),
        message: i18n.t('runGarbageCollectorErrored.message')
      })
    }

    ipcMain.emit(ipcMainEvents.GC_ENDED)
  })
}
