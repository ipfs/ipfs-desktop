import FileStore from './file-store'

export default class PinnedFiles extends FileStore {
  constructor (location) {
    super(location, [])
  }

  add (name, labels = ['unlabelled']) {
    this.data.unshift({
      name: name,
      labels: labels,
      date: new Date()
    })

    this.write()
  }
}
