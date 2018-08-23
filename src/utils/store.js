import Store from 'electron-store'

const store = new Store({
  defaults: {
    dhtClient: true
  }
})

if (store.get('version', 1) === 1) {
  // migrate data
}

// set new config version
store.set('version', 2)

export default store
