const { join } = require('path')
const { ipcMain } = require('electron')
const i18n = require('i18next')
const ICU = require('i18next-icu')
const Backend = require('i18next-fs-backend')
const store = require('./common/store')

const setupI18N = async () => {
  await i18n
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

  ipcMain.on('updateLanguage', async (_, lang) => {
    if (lang === store.get('language')) {
      return
    }

    store.set('language', lang)

    await i18n.changeLanguage(lang)
    ipcMain.emit('languageUpdated', lang)
  })
}

const promise = setupI18N()

module.exports = async () => promise
