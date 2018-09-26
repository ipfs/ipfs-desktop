import Store from 'electron-store'

const store = new Store()

if (store.get('version') !== 3) {
  // migrate data to v3 - the brand new version where we start from fresh!
  store.clear()
  store.set('seenWelcome', false)
  store.set('configs', [])
  store.set('version', 3)
}

export default store
