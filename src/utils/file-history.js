import FileStore from './file-store'

/**
 * Is a File History.
 * @extends FileStore
 */
export default class FileHistory extends FileStore {
  constructor (location) {
    super(location, [])
  }

  /**
   * Adds a file to the history.
   * @param {String} name - file name
   * @param {String} hash - file hash
   * @returns {Void}
   */
  add (name, hash) {
    this.data.unshift({
      name: name,
      hash: hash,
      date: new Date()
    })

    this.write()
  }
}
