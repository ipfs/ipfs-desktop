import { join } from 'path'
import i18n from 'i18next'
import ICU from 'i18next-icu'
import Backend from 'i18next-node-fs-backend'
import LanguageDetector from 'i18next-electron-language-detector'

import en from 'i18next-icu/locale-data/en'

const localeData = [en]

i18n
  .use(new ICU({ localeData: localeData }))
  .use(Backend)
  .use(LanguageDetector)
  .init({
    fallbackLng: {
      'default': ['en']
    },
    debug: process.env.NODE_ENV !== 'production',
    backend: {
      loadPath: join(__dirname, '../../../locales/{{lng}}.json')
    },
    react: {
      wait: true,
      bindI18n: 'languageChanged loaded',
      bindStore: 'added removed',
      nsMode: 'default'
    }
  })

export default i18n
