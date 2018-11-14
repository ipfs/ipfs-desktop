import Store from 'electron-store'

const store = new Store()

if (store.get('version') !== 4) {
  store.clear()
  store.set('seenWelcome', false)
  store.set('config', null)
  store.set('version', 4)
}

export default store
