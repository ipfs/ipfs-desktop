import fs from 'fs'
import {EventEmitter} from 'events'

export default class FileStore extends EventEmitter {
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
  }

  write () {
    fs.writeFileSync(this.path, JSON.stringify(this.data))
    this.emit('change', this.data)
  }

  toArray () {
    if (Array.isArray(this.data)) {
      return this.data
    } else {
      throw new Error('object is not array')
    }
  }

  toObject () {
    return this.data
  }
}
