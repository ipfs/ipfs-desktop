import { join } from 'path'
import { ipcMain } from 'electron'
import i18n from 'i18next'
import ICU from 'i18next-icu'
import Backend from 'i18next-node-fs-backend'
import store from './common/store'

import ar from 'i18next-icu/locale-data/ar'
import ca from 'i18next-icu/locale-data/ca'
import cs from 'i18next-icu/locale-data/cs'
import da from 'i18next-icu/locale-data/da'
import de from 'i18next-icu/locale-data/de'
import el from 'i18next-icu/locale-data/el'
import eo from 'i18next-icu/locale-data/eo'
import es from 'i18next-icu/locale-data/es'
import en from 'i18next-icu/locale-data/en'
import et from 'i18next-icu/locale-data/et'
import fa from 'i18next-icu/locale-data/fa'
import fr from 'i18next-icu/locale-data/fr'
import fi from 'i18next-icu/locale-data/fi'
import he from 'i18next-icu/locale-data/he'
import hi from 'i18next-icu/locale-data/hi'
import hr from 'i18next-icu/locale-data/hr'
import hu from 'i18next-icu/locale-data/hu'
import it from 'i18next-icu/locale-data/it'
import ja from 'i18next-icu/locale-data/ja'
import ko from 'i18next-icu/locale-data/ko'
import lt from 'i18next-icu/locale-data/lt'
import lv from 'i18next-icu/locale-data/lv'
import nl from 'i18next-icu/locale-data/nl'
import no from 'i18next-icu/locale-data/no'
import pl from 'i18next-icu/locale-data/pl'
import pt from 'i18next-icu/locale-data/pt'
import ru from 'i18next-icu/locale-data/ru'
import sk from 'i18next-icu/locale-data/sk'
import sl from 'i18next-icu/locale-data/sl'
import sr from 'i18next-icu/locale-data/sr'
import sv from 'i18next-icu/locale-data/sv'
import tr from 'i18next-icu/locale-data/tr'
import uk from 'i18next-icu/locale-data/uk'
import uz from 'i18next-icu/locale-data/uz'
import zh from 'i18next-icu/locale-data/zh'

const localeData = [
  ar, ca, cs, da, de, el, eo, es, en, et, fa, fi, fr, he, hi, hr, hu, it,
  ja, ko, lt, lv, nl, no, pl, pt, ru, sk, sl, sr, sv, tr, uk, uz, zh
]

export default async function () {
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
