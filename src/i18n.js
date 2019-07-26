import { join } from 'path'
import { ipcMain } from 'electron'
import i18n from 'i18next'
import ICU from 'i18next-icu'
import Backend from 'i18next-node-fs-backend'
import store from './common/store'

import ca from 'i18next-icu/locale-data/ca'
import cs from 'i18next-icu/locale-data/cs'
import da from 'i18next-icu/locale-data/da'
import de from 'i18next-icu/locale-data/de'
import eo from 'i18next-icu/locale-data/eo'
import es from 'i18next-icu/locale-data/es'
import en from 'i18next-icu/locale-data/en'
import fr from 'i18next-icu/locale-data/fr'
import fi from 'i18next-icu/locale-data/fi'
import he from 'i18next-icu/locale-data/he'
import hr from 'i18next-icu/locale-data/hr'
import hu from 'i18next-icu/locale-data/hu'
import it from 'i18next-icu/locale-data/it'
import ja from 'i18next-icu/locale-data/ja'
import ko from 'i18next-icu/locale-data/ko'
import nl from 'i18next-icu/locale-data/nl'
import no from 'i18next-icu/locale-data/no'
import pl from 'i18next-icu/locale-data/pl'
import pt from 'i18next-icu/locale-data/pt'
import ru from 'i18next-icu/locale-data/ru'
import sk from 'i18next-icu/locale-data/sk'
import sl from 'i18next-icu/locale-data/sl'
import sr from 'i18next-icu/locale-data/sr'
import sv from 'i18next-icu/locale-data/sv'
import uk from 'i18next-icu/locale-data/uk'
import zh from 'i18next-icu/locale-data/zh'

const localeData = [ca, cs, da, de, eo, es, en, fi, fr, he, hr, hu, it, ja, ko, nl, no, pl, pt, ru, sk, sl, sr, sv, uk, zh]

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
