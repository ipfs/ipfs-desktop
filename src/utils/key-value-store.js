import FileStore from './file-store'

/**
 * It's a key value store on a file.
 * @extends FileStore
 */
export default class KeyValueStore extends FileStore {
  constructor (location, d = {}) {
    super(location, d)
  }

  /**
   * Gets a value.
   * @param {String} key
   * @param {Any} def
   * @returns {Any}
   */
  get (key, def) {
    return this.data[key] || def
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
