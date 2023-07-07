const mockElectron = require('./electron')
const mockLogger = require('./logger')
const proxyquire = require('proxyquire').noCallThru()

module.exports = function mockStore () {
  // use the real store object, but mock the logger and electron
  return proxyquire('../../../src/common/store', {
    electron: mockElectron(),
    './logger': mockLogger()
  })
}
