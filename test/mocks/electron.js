import { EventEmitter } from 'events'
import sinon from 'sinon'

export default function mockElectron (opts = {}) {
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
