const { EventEmitter } = require('events')
const sinon = require('sinon')

module.exports = function mockElectron (opts = {}) {
  opts.withDock = opts.withDock || false

  const electron = {
    ipcMain: new EventEmitter(),
    BrowserWindow: {
      getAllWindows: sinon.stub()
    },
    app: {}
  }

  if (opts.withDock) {
    electron.app.dock = {
      show: sinon.spy(),
      hide: sinon.spy()
    }
  }

  return electron
}
