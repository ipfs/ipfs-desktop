const { join } = require('path')
const { ipcMain } = require('electron')
const i18n = require('i18next')
const ICU = require('i18next-icu')
const Backend = require('i18next-node-fs-backend')
const store = require('./common/store')

const ar = require('i18next-icu/locale-data/ar')
const ca = require('i18next-icu/locale-data/ca')
const cs = require('i18next-icu/locale-data/cs')
const da = require('i18next-icu/locale-data/da')
const de = require('i18next-icu/locale-data/de')
const el = require('i18next-icu/locale-data/el')
const eo = require('i18next-icu/locale-data/eo')
const es = require('i18next-icu/locale-data/es')
const en = require('i18next-icu/locale-data/en')
const et = require('i18next-icu/locale-data/et')
const fa = require('i18next-icu/locale-data/fa')
const fr = require('i18next-icu/locale-data/fr')
const fi = require('i18next-icu/locale-data/fi')
const he = require('i18next-icu/locale-data/he')
const hi = require('i18next-icu/locale-data/hi')
const hr = require('i18next-icu/locale-data/hr')
const hu = require('i18next-icu/locale-data/hu')
const it = require('i18next-icu/locale-data/it')
const ja = require('i18next-icu/locale-data/ja')
const ko = require('i18next-icu/locale-data/ko')
const lt = require('i18next-icu/locale-data/lt')
const lv = require('i18next-icu/locale-data/lv')
const nl = require('i18next-icu/locale-data/nl')
const no = require('i18next-icu/locale-data/no')
const pl = require('i18next-icu/locale-data/pl')
const pt = require('i18next-icu/locale-data/pt')
const ru = require('i18next-icu/locale-data/ru')
const sk = require('i18next-icu/locale-data/sk')
const sl = require('i18next-icu/locale-data/sl')
const sr = require('i18next-icu/locale-data/sr')
const sv = require('i18next-icu/locale-data/sv')
const tr = require('i18next-icu/locale-data/tr')
const uk = require('i18next-icu/locale-data/uk')
const uz = require('i18next-icu/locale-data/uz')
const zh = require('i18next-icu/locale-data/zh')

const localeData = [
  ar, ca, cs, da, de, el, eo, es, en, et, fa, fi, fr, he, hi, hr, hu, it,
  ja, ko, lt, lv, nl, no, pl, pt, ru, sk, sl, sr, sv, tr, uk, uz, zh
]

module.exports = async function () {
  await i18n
    .use(new ICU({ localeData: localeData }))
    .use(Backend)
    .init({
      lng: store.get('language'),
      fallbackLng: {
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
