const { join } = require('path')
const { ipcMain } = require('electron')
const i18n = require('i18next')
const ICU = require('i18next-icu')
const Backend = require('i18next-fs-backend')
const store = require('./common/store')
const ipcMainEvents = require('./common/ipc-main-events')
const safeStoreSet = require('./utils/safe-store-set')
const logger = require('./common/logger')

module.exports = async function () {
  logger.info('[i18n] init...')
  await i18n
    // @ts-expect-error
    .use(ICU)
    .use(Backend)
    .init({
      lng: store.get('language'),
      fallbackLng: {
        'zh-Hans': ['zh-CN', 'en'],
        'zh-Hant': ['zh-TW', 'en'],
        zh: ['zh-CN', 'en'],
        default: ['en']
      },
      backend: {
        loadPath: join(__dirname, '../assets/locales/{{lng}}.json')
      }
    })
  logger.info('[i18n] init done')

  ipcMain.on(ipcMainEvents.LANG_UPDATED, async (_, lang) => {
    if (lang === store.get('language')) {
      return
    }

    safeStoreSet('language', lang)

    await i18n.changeLanguage(lang)
    ipcMain.emit(ipcMainEvents.LANG_UPDATED, lang)
  })
}
