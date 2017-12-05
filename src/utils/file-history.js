import fs from 'fs'
import {EventEmitter} from 'events'

export default class FileHistory extends EventEmitter {
  constructor (location) {
    super()
    let history = []

    if (fs.existsSync(location)) {
      history = JSON.parse(fs.readFileSync(location))
    } else {
      history = []
      fs.writeFileSync(location, JSON.stringify(history))
    }

    this.history = history
    this.location = location
  }

  _save () {
    fs.writeFileSync(this.location, JSON.stringify(this.history))
  }

  add (name, hash) {
    this.history.unshift({
      name: name,
      hash: hash,
      date: new Date()
    })

    this._save()
    this.emit('change', this.history)
  }

  toArray () {
    return this.history
  }
}
