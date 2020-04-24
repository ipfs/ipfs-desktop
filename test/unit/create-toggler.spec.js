/* eslint-env mocha */

const sinon = require('sinon')
const chai = require('chai')
const { expect } = chai
const dirtyChai = require('dirty-chai')
const mockElectron = require('./mocks/electron')
const mockStore = require('./mocks/store')
const mockLogger = require('./mocks/logger')

const proxyquire = require('proxyquire').noCallThru()
chai.use(dirtyChai)

describe('Create toggler', () => {
  const option = 'OPT'
  let electron, store, createToggler, logger

  beforeEach(() => {
    electron = mockElectron()
    store = mockStore()
    logger = mockLogger()
    createToggler = proxyquire('../../src/utils/create-toggler', {
      electron: electron,
      '../common/logger': logger,
      '../common/store': store
    })
  })

  it('activate option with success', (done) => {
    const spy = sinon.spy()
    const activate = sinon.stub().returns(true)
    createToggler(option, activate)

    electron.ipcMain.on('configUpdated', spy)
    electron.ipcMain.emit(`toggle_${option}`)

    setImmediate(() => {
      expect(store.get.callCount).to.equal(1)
      expect(activate.callCount).to.equal(1)
      expect(store.set.callCount).to.equal(1)
      expect(spy.calledOnce).to.equal(true)
      expect(store.get(option)).to.equal(true)
      done()
    })
  })

  it('activate option with error', (done) => {
    const spy = sinon.spy()
    store.set(option, false)
    const activate = sinon.stub().returns(false)
    createToggler(option, activate)

    electron.ipcMain.on('configUpdated', spy)
    electron.ipcMain.emit(`toggle_${option}`)

    setImmediate(() => {
      expect(store.get.callCount).to.equal(1)
      expect(activate.callCount).to.equal(1)
      expect(store.set.callCount).to.equal(1)
      expect(spy.calledOnce).to.equal(true)
      expect(store.get(option)).to.equal(false)
      done()
    })
  })

  it('disable option with success', (done) => {
    store.set(option, true)
    const spy = sinon.spy()
    const activate = sinon.stub().returns(true)
    createToggler(option, activate)

    electron.ipcMain.on('configUpdated', spy)
    electron.ipcMain.emit(`toggle_${option}`)

    setImmediate(() => {
      expect(store.get.callCount).to.equal(1)
      expect(activate.callCount).to.equal(1)
      expect(store.set.callCount).to.equal(2)
      expect(spy.calledOnce).to.equal(true)
      expect(store.get(option)).to.equal(false)
      done()
    })
  })

  it('disable option with error', (done) => {
    store.set(option, true)
    const spy = sinon.spy()
    const activate = sinon.stub().returns(false)
    createToggler(option, activate)

    electron.ipcMain.on('configUpdated', spy)
    electron.ipcMain.emit(`toggle_${option}`)

    setImmediate(() => {
      expect(store.get.callCount).to.equal(1)
      expect(activate.callCount).to.equal(1)
      expect(store.set.callCount).to.equal(1)
      expect(spy.calledOnce).to.equal(true)
      expect(store.get(option)).to.equal(true)
      done()
    })
  })

  it('enable and disable option with success', (done) => {
    const activate = sinon.stub().returns(true)

    createToggler(option, activate)
    electron.ipcMain.emit(`toggle_${option}`)
    electron.ipcMain.emit(`toggle_${option}`)

    setImmediate(() => {
      expect(store.get.callCount).to.equal(2)
      expect(activate.callCount).to.equal(2)
      expect(store.set.callCount).to.equal(2)
      done()
    })
  })
})
