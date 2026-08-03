const { test, expect } = require('@playwright/test')

const { detectCurrentStrategy } = require('../../src/provide-strategy')

test.describe('detectCurrentStrategy', function () {
  test('reads an unset strategy as the kubo default', () => {
    expect(detectCurrentStrategy('')).toEqual('default')
  })

  test('names a strategy IPFS Desktop offers', () => {
    expect(detectCurrentStrategy('pinned+mfs+unique')).toEqual('pinned+mfs+unique')
    expect(detectCurrentStrategy('pinned+unique')).toEqual('pinned+unique')
  })

  // Anything else the user picked themselves. The tray shows it read-only so
  // a click cannot overwrite it.
  test('leaves a hand-set strategy alone', () => {
    expect(detectCurrentStrategy('all')).toEqual('manual')
    expect(detectCurrentStrategy('pinned')).toEqual('manual')
  })
})
