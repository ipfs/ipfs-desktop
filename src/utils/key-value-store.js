import FileStore from './file-store'

export default class KeyValueStore extends FileStore {
  constructor (location) {
    super(location, {})
    this.listeners = {}
  }

  get (key) {
    return this.data[key]
  }

  set (key, value) {
    if (!this.listeners[key]) {
      this.listeners[key] = []
    }

    const oldValue = this.data[key]
    this.data[key] = value
    this.write()

    this.listeners[key].forEach(listener => {
      listener(oldValue, value)
    })
  }

  listen (key, listener) {
    if (!this.listeners[key]) {
      this.listeners[key] = []
    }

    this.listeners[key].push(listener)
  }
}
