import electron from 'electron'
import Store from 'electron-store'

const store = new Store()

if (store.get('version') !== 5) {
  store.clear()

  // default config
  store.set('ipfsConfig', {
    type: 'go',
    path: '',
    flags: ['--migrate=true', '--routing=dhtclient', '--enable-gc=true'],
    keysize: 2048
  })

  store.set('version', 5)
}

if (!store.get('language')) {
  store.set('language', (electron.app || electron.remote.app).getLocale())
}

if (!store.get('experiments')) {
  store.set('experiments', {})
}

export default store
