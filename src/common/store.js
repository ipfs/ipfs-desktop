const electron = require('electron')
const Store = require('electron-store')

const defaults = {
  ipfsConfig: {
    type: 'go',
    path: '',
    flags: [
      '--agent-version-suffix=desktop',
      '--migrate',
      '--enable-gc',
      '--routing=dhtclient'
    ]
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
  },
  '>0.13.2': store => {
    const flags = store.get('ipfsConfig.flags', [])
    const automaticGC = store.get('automaticGC', false)
    // ensure checkbox follows cli flag config
    if (flags.includes('--enable-gc') && !automaticGC) {
      store.set('automaticGC', true)
    }
  },
  '>=0.17.0': store => {
    let flags = store.get('ipfsConfig.flags', [])

    // make sure version suffix is always present and normalized
    const setVersionSuffix = '--agent-version-suffix=desktop'
    if (!flags.includes(setVersionSuffix)) {
      // remove any custom suffixes, if present
      flags = flags.filter(f => !f.startsWith('--agent-version-suffix='))
      // set /desktop
      flags.push('--agent-version-suffix=desktop')
      store.set('ipfsConfig.flags', flags)
    }
    // merge routing flags into one
    if (flags.includes('--routing') && flags.includes('dhtclient')) {
      flags = flags.filter(f => f !== '--routing').filter(f => f !== 'dhtclient')
      flags.push('--routing=dhtclient')
      store.set('ipfsConfig.flags', flags)
    }
  }
}

const store = new Store({
  defaults,
  migrations
})

module.exports = store
