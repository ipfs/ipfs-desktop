const { EventEmitter } = require('events')
const sinon = require('sinon')

module.exports = function mockElectron (opts = {}) {
  opts.withDock = opts.withDock || false

  const electron = {
    ipcMain: new EventEmitter(),
    BrowserWindow: {
      getAllWindows: sinon.stub()
    },
    app: {
      getLocale: sinon.stub().returns('en-US')
    },
    clipboard: {
      writeText: sinon.spy()
    }
  }

  if (opts.withDock) {
    electron.app.dock = {
      show: sinon.spy(),
      hide: sinon.spy()
    }
  }

  return electron
}
