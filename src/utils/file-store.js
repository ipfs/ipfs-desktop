import fs from 'fs'
import {EventEmitter} from 'events'

/**
 * It's a File Store.
 * @extends EventEmitter
 */
export default class FileStore extends EventEmitter {
  /**
   * FileStore constructor.
   * @param {String} path  - File path
   * @param {Object} [initial] - Initial value of the file
   */
  constructor (path, initial = []) {
    super()
    let data = initial

    if (fs.existsSync(path)) {
      data = JSON.parse(fs.readFileSync(path))
    } else {
      fs.writeFileSync(path, JSON.stringify(data))
    }

    this.data = data
    this.path = path
    this.modified = false

    // Function that runs every 5 seconds to write the
    // file to the disk if there are any modifications.
    const timer = () => {
      this.writeToDisk()
      setTimeout(timer.bind(this), 5000)
    }

    timer()

    // If the process is exiting, we should save the data.
    process.on('exit', () => { this.writeToDisk() })
  }

  /**
   * Writes the data to the disk if it was modified.
   * @returns {Void}
   */
  writeToDisk () {
    if (this.modified) {
      fs.writeFileSync(this.path, JSON.stringify(this.data))
      this.modified = false
    }
  }

  /**
   * Tells the store that it was modified and emits
   * a change event with the data.
   * @returns {Void}
   */
  write () {
    this.modified = true
    this.emit('change', this.data)
  }

  /**
   * Gets the data into an array. If it isn't an array,
   * an error is thrown.
   * @returns {Array}
   */
  toArray () {
    if (Array.isArray(this.data)) {
      return this.data
    } else {
      throw new Error('object is not array')
    }
  }

  /**
   * Gets the data object.
   * @returns {Object}
   */
  toObject () {
    return this.data
  }
}
