import { ipcMain } from 'electron'
import { i18n, store } from '../utils'

export default function () {
  ipcMain.on('updateLanguage', async (_, lang) => {
    if (lang === store.get('language')) {
      return
    }

    store.set('language', lang)

    await i18n.changeLanguage(lang)
    ipcMain.emit('languageUpdated', lang)
  })
}
