const electron = require('electron')
const Store = require('electron-store')

const defaults = {
  ipfsConfig: {
    type: 'go',
    path: '',
    flags: [
      '--migrate',
      '--enable-gc',
      '--routing', 'dhtclient'
    ],
    keysize: 2048
  },
  language: (electron.app || electron.remote.app).getLocale(),
  experiments: {}
}

const migrations = {
  '>=0.11.0': store => {
    store.delete('version')

    const flags = store.get('ipfsConfig.flags', [])

    if (flags.includes('--migrate=true') || flags.includes('--enable-gc=true')) {
      store.set('ipfsConfig.flags', defaults.ipfsConfig.flags)
    }
  }
}

const store = new Store({
  defaults,
  migrations
})

module.exports = store
