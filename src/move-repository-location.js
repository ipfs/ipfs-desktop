const i18n = require('i18next')
const path = require('path')
const fs = require('fs-extra')
const store = require('./common/store')
const logger = require('./common/logger')
const { showDialog, recoverableErrorDialog, selectDirectory } = require('./dialogs')
const dock = require('./utils/dock')

module.exports = function ({ stopIpfs, startIpfs }) {
  dock.run(async () => {
    logger.info('[move repository] user prompted about effects')

    const opt = showDialog({
      title: i18n.t('moveRepositoryWarnDialog.title'),
      message: i18n.t('moveRepositoryWarnDialog.message'),
      type: 'warning',
      buttons: [
        i18n.t('moveRepositoryWarnDialog.action'),
        i18n.t('cancel')
      ],
      showDock: false
    })

    if (opt !== 0) {
      logger.info('[move repository] user canceled')
      return
    }

    logger.info('[move repository] user will pick directory')
    const dir = await selectDirectory()

    if (!dir) {
      logger.info('[move repository] user canceled')
      return
    }

    const config = store.get('ipfsConfig')

    const currDir = config.path
    const currName = path.basename(currDir)
    const newDir = path.join(dir, currName)

    if (currDir === newDir) {
      logger.info('[move repository] new dir is the same as old dir')

      return showDialog({
        title: i18n.t('moveRepositorySameDirDialog.title'),
        message: i18n.t('moveRepositorySameDirDialog.message', { location: newDir }),
        type: 'warning',
        showDock: false
      })
    }

    if (fs.existsSync(newDir)) {
      logger.info('[move repository] new dir already exists')

      return showDialog({
        title: i18n.t('moveRepositoryDirExists.title'),
        message: i18n.t('moveRepositoryDirExists.message', { location: newDir }),
        type: 'warning',
        showDock: false
      })
    }

    await stopIpfs()

    try {
      await fs.move(currDir, newDir)
      logger.info(`[move repository] moved from ${currDir} to ${newDir}`)
    } catch (err) {
      logger.error(`[move repository] ${err.toString()}`)
      return recoverableErrorDialog(err, {
        title: i18n.t('moveRepositoryFailed.title'),
        message: i18n.t('moveRepositoryFailed.message', { currDir, newDir })
      })
    }

    config.path = newDir
    store.set('ipfsConfig', config)
    logger.info('[move repository] configuration updated', { withAnalytics: 'MOVE_REPOSITORY' })

    showDialog({
      title: i18n.t('moveRepositorySuccessDialog.title'),
      message: i18n.t('moveRepositorySuccessDialog.message', { location: newDir }),
      showDock: false
    })

    await startIpfs()
  })
}
