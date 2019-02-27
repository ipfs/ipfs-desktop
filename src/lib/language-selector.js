import { ipcMain } from 'electron'
import { i18n, store } from '../utils'

export default async function ({ sendToMenubar }) {
  ipcMain.on('languageUpdated', async (_, lang) => {
    if (lang === store.get('language')) {
      return
    }

    store.set('language', lang)

    await i18n.changeLanguage(lang)
    sendToMenubar('languageUpdated', lang)
  })
}
