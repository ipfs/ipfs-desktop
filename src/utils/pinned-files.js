import FileStore from './file-store'

/**
 * Is a list of Pinned Files.
 * @extends FileStore
 */
export default class PinnedFiles extends FileStore {
  constructor (location) {
    super(location, {})
  }

  /**
   * Adds an hash to the pinned files.
   * @param {String} hash - the hash
   * @param {String} [tag] - the tag
   * @returns {Void}
   */
  add (hash, tag = '') {
    this.data[hash] = tag
    this.write()
  }

  /**
   * Removes an hash from the pinned files.
   * @param {String} hash - the hash
   * @returns {Void}
   */
  remove (hash) {
    delete this.data[hash]
    this.write()
  }
}
