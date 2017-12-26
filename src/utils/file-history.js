import FileStore from './file-store'

export default class FileHistory extends FileStore {
  constructor (location) {
    super(location, [])
  }

  add (name, hash) {
    this.data.unshift({
      name: name,
      hash: hash,
      date: new Date()
    })

    this.write()
  }
}
