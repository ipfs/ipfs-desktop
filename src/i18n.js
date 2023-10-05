const { join } = require('path')
const { ipcMain } = require('electron')
const i18n = require('i18next')
const ICU = require('i18next-icu')
const Backend = require('i18next-fs-backend')
const store = require('./common/store')
const ipcMainEvents = require('./common/ipc-main-events')
const logger = require('./common/logger')
const getCtx = require('./context')

module.exports = async function () {
  const ctx = getCtx()
  logger.info('[i18n] init...')
  const lng = store.get('language')
  logger.info(`[i18n] configured language: ${lng}`)
  await i18n
    // @ts-expect-error
    .use(ICU)
    .use(Backend)
    .init({
      lng,
      fallbackLng: {
        'zh-Hans': ['zh-CN', 'en'],
        'zh-Hant': ['zh-TW', 'en'],
        zh: ['zh-CN', 'en'],
        default: ['en']
      },
      backend: {
        loadPath: join(__dirname, '../assets/locales/{{lng}}.json')
      }
    },
    (err, t) => {
      if (err) {
        /**
         * even if an error occurs here, i18n still may work properly.
         * e.g. https://github.com/ipfs/ipfs-desktop/issues/2627
         * Language's of "en-US" or "zh" may not exist at `join(__dirname, '../assets/locales/{{lng}}.json')` but i18next loads
         * the appropriate language file with/without the region code. Partially discussed at https://github.com/i18next/i18next/issues/964
         */
        logger.error('[i18n] init error')
        logger.error(err)
      }
      logger.info('[i18n] init done')
      ctx.setProp('i18n.initDone', true)
    })

  ipcMain.on(ipcMainEvents.LANG_UPDATED, async (_, lang) => {
    logger.fileLogger.info('[i18n] language updated to %s requested', lang)
    if (lang === store.get('language')) {
      logger.fileLogger.info('[i18n] language update skipped due to no change')
      return
    }

    store.safeSet('language', lang)

    await i18n.changeLanguage(lang, async (err, t) => {
      if (err) {
        logger.error('[i18n] language update failed', err)
        return
      }
      logger.fileLogger.info('[i18n] language update succeeded')
      ipcMain.emit(ipcMainEvents.LANG_UPDATED_SUCCEEDED)
    })
  })
}
