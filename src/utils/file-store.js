import fs from 'fs'
import {EventEmitter} from 'events'

export default class FileStore extends EventEmitter {
  constructor (path, initial = []) {
    super()
    let data = initial

    if (fs.existsSync(path)) {
      data = JSON.parse(fs.readFileSync(path))
    } else {
      data = []
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
    return this.data
  }
}
