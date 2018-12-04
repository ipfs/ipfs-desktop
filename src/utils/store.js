import Store from 'electron-store'

const store = new Store()

if (store.get('version') !== 4) {
  store.clear()

  // default config
  store.set('config', {
    type: 'go',
    path: '',
    flags: ['--migrate=true', '--routing=dhtclient'],
    keysize: 4096
  })

  store.set('version', 4)
}

export default store
