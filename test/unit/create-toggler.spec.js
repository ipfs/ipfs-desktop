/* eslint-env mocha */

import sinon from 'sinon'
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import mockElectron from './mocks/electron'
import mockStore from './mocks/store'
import mockWebUI from './mocks/webui'

const proxyquire = require('proxyquire').noCallThru()
chai.use(dirtyChai)

describe('Create toggler', () => {
  const option = 'OPT'
  let electron, store, webui, createToggler

  beforeEach(() => {
    electron = mockElectron()
    store = mockStore()
    webui = mockWebUI()
    createToggler = proxyquire('../../src/create-toggler', {
      electron: electron,
      './common/store': store
    }).default
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
