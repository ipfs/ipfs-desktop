import FileStore from './file-store'

export default class KeyValueStore extends FileStore {
  constructor (location) {
    super(location, {})
  }

  get (key) {
    return this.data[key]
  }

  set (key, value) {
    this.emit(key, this.data[key], value)
    this.data[key] = value
    this.write()
  }
}
