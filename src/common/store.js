const electron = require('electron')
const Store = require('electron-store')

const store = new Store()

const defaultFlags = [
  '--migrate',
  '--enable-gc',
  '--routing', 'dhtclient'
]

if (store.get('version', 0) < 5) {
  store.clear()

  // default config
  store.set('ipfsConfig', {
    type: 'go',
    path: '',
    flags: defaultFlags,
    keysize: 2048
  })

  store.set('version', 5)
}

const flags = store.get('ipfsConfig.flags', [])

if (flags.includes('--migrate=true') || flags.includes('--enable-gc=true')) {
  store.set('ipfsConfig.flags', defaultFlags)
}

if (!store.get('language')) {
  store.set('language', (electron.app || electron.remote.app).getLocale())
}

if (!store.get('experiments')) {
  store.set('experiments', {})
}

module.exports = store
