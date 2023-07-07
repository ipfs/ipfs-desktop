const sinon = require('sinon')
const mockElectron = require('./mocks/electron')
const mockStore = require('./mocks/store')
const mockLogger = require('./mocks/logger')
const proxyquire = require('proxyquire').noCallThru()
const { test, expect } = require('@playwright/test')

test.describe('safe-store-set', () => {
  let electron, store, safeStoreSet, logger

  test.beforeEach(() => {
    electron = mockElectron()
    store = mockStore()
    logger = mockLogger()
    safeStoreSet = proxyquire('../../src/utils/safe-store-set', {
      electron: electron,
      '../common/logger': logger,
      '../common/store': store
    })
    sinon.spy(logger, 'error')
    sinon.spy(store, 'set')
  })

  test('with valid values', async () => {
    const spy = sinon.spy()
    safeStoreSet('foobar', 'baz', spy)

    expect(store.set.callCount).toEqual(1)
    expect(spy.callCount).toEqual(1)
    expect(logger.error.callCount).toEqual(0)
  })

  test('logs error with undefined key', async () => {
    const spy = sinon.spy()
    safeStoreSet('foobar', undefined, spy)

    expect(store.set.callCount).toEqual(1)
    expect(spy.callCount).toEqual(0)
    expect(store.get('foobar')).toBe('baz')
    expect(logger.error.callCount).toEqual(1)
  })
})
