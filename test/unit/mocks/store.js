const mockElectron = require('./electron.js')
const mockLogger = require('./logger.js')
const Store = require('electron-store')
const proxyquire = require('proxyquire').noCallThru()

module.exports = function mockStore () {
  function MockElectronStoreConstructor ({ ...options }) {
    return new Store({ ...options, migrations: {} })
  }
  // use the real store object, but mock the logger and electron
  return proxyquire('../../../src/common/store.js', {
    electron: mockElectron(),
    './logger': mockLogger(),
    'electron-store': MockElectronStoreConstructor
  })
}
