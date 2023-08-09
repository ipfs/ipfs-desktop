const sinon = require('sinon')
const mockElectron = require('./mocks/electron')
const mockLogger = require('./mocks/logger')
const proxyquire = require('proxyquire').noCallThru()
const { test, expect } = require('@playwright/test')

test.describe('store', () => {
  test.describe('.safeSet', () => {
    let electron, store, logger

    test.beforeEach(() => {
      electron = mockElectron()
      logger = mockLogger()
      store = proxyquire('../../src/common/store', {
        electron: electron,
        './logger': logger
      })
      sinon.spy(logger, 'error')
      sinon.spy(store, 'set')
      sinon.spy(store, 'safeSet')
    })

    test('with valid values', async () => {
      const spy = sinon.spy()
      store.safeSet('foobar', 'baz', spy)

      expect(store.safeSet.callCount).toEqual(1)
      expect(store.set.callCount).toEqual(1)
      expect(spy.callCount).toEqual(1)
      expect(logger.error.callCount).toEqual(0)
    })

    test('logs error for undefined value', async () => {
      const successSpy = sinon.spy()
      store.safeSet('foobar', undefined, successSpy)

      expect(store.safeSet.callCount).toEqual(1)
      expect(store.set.callCount).toEqual(1)
      expect(successSpy.callCount).toEqual(0)
      expect(store.get('foobar')).toBe('baz')
      expect(logger.error.callCount).toEqual(1)
    })
  })
})
