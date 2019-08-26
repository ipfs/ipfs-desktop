import sinon from 'sinon'

export default function mockStore () {
  let store = {}

  return {
    get: sinon.stub().callsFake((key, def) => {
      return typeof store[key] !== 'undefined' ? store[key] : def
    }),
    set: sinon.stub().callsFake((key, val) => {
      store[key] = val
    }),
    clear: () => {
      store = {}
    },
    get store () {
      return store
    }
  }
}
