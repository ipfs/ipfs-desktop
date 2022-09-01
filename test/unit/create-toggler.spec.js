const sinon = require('sinon')
const mockElectron = require('./mocks/electron')
const mockStore = require('./mocks/store')
const mockLogger = require('./mocks/logger')
const proxyquire = require('proxyquire').noCallThru()
const { test, expect } = require('@playwright/test')
const ipcMainEvents = require('../../src/common/ipc-main-events')

test.describe('Create toggler', () => {
  const option = 'OPT'
  let electron, store, createToggler, logger

  test.beforeEach(() => {
    electron = mockElectron()
    store = mockStore()
    logger = mockLogger()
    createToggler = proxyquire('../../src/utils/create-toggler', {
      electron: electron,
      '../common/logger': logger,
      '../common/store': store
    })
  })

  test('activate option with success', async () => {
    const spy = sinon.spy()
    const activate = sinon.stub().returns(true)
    createToggler(option, activate)

    electron.ipcMain.on(ipcMainEvents.CONFIG_UPDATED, spy)
    await electron.ipcMain.emit(`toggle_${option}`)

    expect(store.get.callCount).toEqual(1)
    expect(activate.callCount).toEqual(1)
    expect(store.set.callCount).toEqual(1)
    expect(spy.calledOnce).toBeTruthy()
    expect(store.get(option)).toBeTruthy()
  })

  test('activate option with error', async () => {
    const spy = sinon.spy()
    store.set(option, false)
    const activate = sinon.stub().returns(false)
    createToggler(option, activate)

    electron.ipcMain.on(ipcMainEvents.CONFIG_UPDATED, spy)
    await electron.ipcMain.emit(`toggle_${option}`)

    expect(store.get.callCount).toEqual(1)
    expect(activate.callCount).toEqual(1)
    expect(store.set.callCount).toEqual(1)
    expect(spy.calledOnce).toBeTruthy()
    expect(store.get(option)).toEqual(false)
  })

  test('disable option with success', async () => {
    store.set(option, true)
    const spy = sinon.spy()
    const activate = sinon.stub().returns(true)
    createToggler(option, activate)

    electron.ipcMain.on(ipcMainEvents.CONFIG_UPDATED, spy)
    await electron.ipcMain.emit(`toggle_${option}`)

    expect(store.get.callCount).toEqual(1)
    expect(activate.callCount).toEqual(1)
    expect(store.set.callCount).toEqual(2)
    expect(spy.calledOnce).toBeTruthy()
    expect(store.get(option)).toEqual(false)
  })

  test('disable option with error', async () => {
    store.set(option, true)
    const spy = sinon.spy()
    const activate = sinon.stub().returns(false)
    createToggler(option, activate)

    electron.ipcMain.on(ipcMainEvents.CONFIG_UPDATED, spy)
    await electron.ipcMain.emit(`toggle_${option}`)

    expect(store.get.callCount).toEqual(1)
    expect(activate.callCount).toEqual(1)
    expect(store.set.callCount).toEqual(1)
    expect(spy.calledOnce).toBeTruthy()
    expect(store.get(option)).toBeTruthy()
  })

  test('enable and disable option with success', async () => {
    const activate = sinon.stub().returns(true)

    createToggler(option, activate)
    electron.ipcMain.emit(ipcMainEvents.TOGGLE(option))
    await electron.ipcMain.emit(ipcMainEvents.TOGGLE(option))

    expect(store.get.callCount).toEqual(2)
    expect(activate.callCount).toEqual(2)
    expect(store.set.callCount).toEqual(2)
  })
})
