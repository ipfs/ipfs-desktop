/* eslint-env mocha */

const sinon = require('sinon')
const chai = require('chai')
const { expect } = chai
const os = require('os')
const dirtyChai = require('dirty-chai')
const mockElectron = require('./mocks/electron')
const mockStore = require('./mocks/store')
const mockWebUI = require('./mocks/webui')
const mockLogger = require('./mocks/logger')

const proxyquire = require('proxyquire').noCallThru()
chai.use(dirtyChai)

describe('Create toggler', () => {
  const option = 'OPT'
  let electron, store, webui, createToggler, logger

  beforeEach(() => {
    electron = mockElectron()
    store = mockStore()
    webui = mockWebUI()
    logger = mockLogger()
    createToggler = proxyquire('../../src/utils/create-toggler', {
      electron: electron,
      '../common/logger': logger,
      '../common/store': store
    })
  })

  it('activate option with success', (done) => {
    const activate = sinon.stub().returns(true)
    createToggler({ webui: webui }, option, activate)
    electron.ipcMain.emit('config.toggle', null, option)

    setImmediate(() => {
      expect(store.get.callCount).to.equal(1)
      expect(activate.callCount).to.equal(1)
      expect(store.set.callCount).to.equal(1)

      const args = webui.webContents.send.lastCall.args

      expect(args[0]).to.equal('config.changed')
      expect(args[1]).to.deep.equal({
        changed: 'OPT',
        platform: os.platform(),
        config: {
          OPT: true
        },
        success: true
      })

      done()
    })
  })

  it('activate option with error', (done) => {
    const activate = sinon.stub().returns(false)
    createToggler({ webui: webui }, option, activate)
    electron.ipcMain.emit('config.toggle', null, option)

    setImmediate(() => {
      expect(store.get.callCount).to.equal(1)
      expect(activate.callCount).to.equal(1)
      expect(store.set.callCount).to.equal(0)

      const args = webui.webContents.send.lastCall.args

      expect(args[0]).to.equal('config.changed')
      expect(args[1]).to.deep.equal({
        changed: 'OPT',
        platform: os.platform(),
        config: {},
        success: false
      })

      done()
    })
  })

  it('disable option with success', (done) => {
    const activate = sinon.stub().returns(true)
    store.set(option, true)

    createToggler({ webui: webui }, option, activate)
    electron.ipcMain.emit('config.toggle', null, option)

    setImmediate(() => {
      expect(store.get.callCount).to.equal(1)
      expect(activate.callCount).to.equal(1)
      expect(store.set.callCount).to.equal(2)

      const args = webui.webContents.send.lastCall.args

      expect(args[0]).to.equal('config.changed')
      expect(args[1]).to.deep.equal({
        changed: 'OPT',
        platform: os.platform(),
        config: {
          OPT: false
        },
        success: true
      })

      done()
    })
  })

  it('disable option with error', (done) => {
    const activate = sinon.stub().returns(false)
    store.set(option, true)

    createToggler({ webui: webui }, option, activate)
    electron.ipcMain.emit('config.toggle', null, option)

    setImmediate(() => {
      expect(store.get.callCount).to.equal(1)
      expect(activate.callCount).to.equal(1)
      expect(store.set.callCount).to.equal(1)

      const args = webui.webContents.send.lastCall.args

      expect(args[0]).to.equal('config.changed')
      expect(args[1]).to.deep.equal({
        changed: 'OPT',
        platform: os.platform(),
        config: {
          OPT: true
        },
        success: false
      })

      done()
    })
  })

  it('enable and disable option with success', (done) => {
    const activate = sinon.stub().returns(true)

    createToggler({ webui: webui }, option, activate)
    electron.ipcMain.emit('config.toggle', null, option)
    electron.ipcMain.emit('config.toggle', null, option)

    setImmediate(() => {
      expect(store.get.callCount).to.equal(2)
      expect(activate.callCount).to.equal(2)
      expect(store.set.callCount).to.equal(2)
      done()
    })
  })

  it('do not trigger anything on different option', (done) => {
    const activate = sinon.spy()

    createToggler({ webui: webui }, option, activate)
    electron.ipcMain.emit('config.toggle', null, 'ANOTHER_OPTION')

    setImmediate(() => {
      expect(store.get.callCount).to.equal(0)
      expect(activate.callCount).to.equal(0)
      expect(store.set.callCount).to.equal(0)
      done()
    })
  })
})
