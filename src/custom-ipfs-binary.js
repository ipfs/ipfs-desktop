const i18n = require('i18next')
const electronReadyModules = require('./electronModulesAfterAppReady')
const { showDialog } = require('./dialogs')
const logger = require('./common/logger')
const store = require('./common/store')
const dock = require('./utils/dock')
const handleError = require('./handleError')

const SETTINGS_KEY = 'binaryPath'

/**
 *
 * @param {Awaited<import('./context')>} ctx
 */
async function setCustomBinary (ctx) {
  await dock.run(async () => {
    logger.info('[custom binary] request to change')
    let opt = await showDialog({
      showDock: false,
      title: i18n.t('setCustomIpfsBinaryConfirmation.title'),
      message: i18n.t('setCustomIpfsBinaryConfirmation.message'),
      type: 'warning',
      buttons: [
        i18n.t('yes'),
        i18n.t('no')
      ]
    })

    if (opt !== 0) {
      logger.info('[custom binary] user canceled')
      return
    }
    const { app, dialog } = await electronReadyModules
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: i18n.t('pickCustomIpfsBinary'),
      defaultPath: app.getPath('home'),
      properties: ['openFile']
    })

    if (canceled || filePaths.length === 0) {
      logger.info('[custom binary] user canceled')
      return
    }

    store.set(SETTINGS_KEY, filePaths[0])

    opt = await showDialog({
      showDock: false,
      title: i18n.t('setCustomIpfsBinarySuccess.title'),
      message: i18n.t('setCustomIpfsBinarySuccess.message', { path: filePaths[0] }),
      buttons: [
        i18n.t('restart'),
        i18n.t('close')
      ]
    })

    logger.info(`[custom binary] updated to ${filePaths[0]}`)

    if (opt === 0) {
      ctx.restartIpfs()
    }
  })
}

/**
 *
 * @param {Awaited<import('./context')>} ctx
 */
function clearCustomBinary (ctx) {
  store.delete(SETTINGS_KEY)
  logger.info('[custom binary] cleared')

  showDialog({
    title: i18n.t('clearCustomIpfsBinarySuccess.title'),
    message: i18n.t('clearCustomIpfsBinarySuccess.message'),
    buttons: [
      i18n.t('restart'),
      i18n.t('close')
    ]
  }).then((opt) => {
    if (opt === 0) {
      ctx.restartIpfs()
    }
  }).catch((err) => {
    logger.error('Could not clear custom binary')
    handleError(err)
  })
}

function hasCustomBinary () {
  return typeof store.get(SETTINGS_KEY) === 'string'
}

function getCustomBinary () {
  if (hasCustomBinary()) {
    return store.get(SETTINGS_KEY)
  }
}

module.exports = {
  setCustomBinary,
  clearCustomBinary,
  hasCustomBinary,
  getCustomBinary
}
