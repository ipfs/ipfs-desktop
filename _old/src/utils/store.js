import Store from 'electron-store'

const store = new Store()

if (store.get('version', 1) === 1) {
  // migrate data to v2
  const path = store.get('ipfsPath', null)
  const dhtClient = store.get('dhtClient', true)

  store.delete('ipfsPath')
  store.delete('dhtClient')
  store.delete('ipfs')

  if (path !== null) {
    store.set('ipfs.path', path)
    store.set('ipfs.flags', dhtClient ? ['--routing=dhtclient'] : [])
  }

  // set new config version
  store.set('version', 2)
}

export default store
