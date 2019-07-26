import { app } from 'electron'
import i18n from 'i18next'
import path from 'path'
import fs from 'fs-extra'
import store from './store'
import logger from './logger'
import { showDialog, recoverableErrorDialog, selectDirectory } from './dialogs'

async function runWithDock (fn) {
  if (app.dock) app.dock.show()
  await fn()
  if (app.dock) app.dock.hide()
}

export default function ({ stopIpfs, startIpfs }) {
  runWithDock(async () => {
    logger.info('[move repository] user prompted about effects')

    const opt = showDialog({
      title: i18n.t('moveRepositoryWarnDialog.title'),
      message: i18n.t('moveRepositoryWarnDialog.message'),
      type: 'warning',
      buttons: [
        i18n.t('moveRepositoryWarnDialog.action'),
        i18n.t('cancel')
      ]
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
        type: 'warning'
      })
    }

    await stopIpfs()

    try {
      await fs.move(currDir, newDir)
      logger.info(`[move repository] moved from ${currDir} to ${newDir}`)
    } catch (err) {
      logger.error(`[move repository] ${err.toString()}`)
      return recoverableErrorDialog(err)
    }

    config.path = newDir
    store.set('ipfsConfig', config)
    logger.info('[move repository] configuration updated')

    showDialog({
      title: i18n.t('moveRepositorySuccessDialog.title'),
      message: i18n.t('moveRepositorySuccessDialog.message', { location: newDir })
    })

    await startIpfs()
  })
}
