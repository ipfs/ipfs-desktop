import FileStore from './file-store'

/**
 * It's a key value store on a file.
 * @extends FileStore
 */
export default class KeyValueStore extends FileStore {
  constructor (location) {
    super(location, {})
  }

  /**
   * Gets a value.
   * @param {String} key
   * @returns {Any}
   */
  get (key) {
    return this.data[key]
  }

  /**
   * Sets a key with a value.
   * @param {String} key
   * @param {String} value
   * @returns {Void}
   */
  set (key, value) {
    this.emit(key, value, this.data[key])
    this.data[key] = value
    this.write()
  }
}
