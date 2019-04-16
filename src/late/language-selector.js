import i18n from 'i18next'
import { ipcMain } from 'electron'
import { store } from '../utils'

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
