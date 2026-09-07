const sinon = require('sinon')
const { test, expect } = require('@playwright/test')

const proxyquire = require('proxyquire')
  .noCallThru()
  .noPreserveCache()

function setup ({ construct, loadFile }) {
  const ctx = { setProp: sinon.spy() }
  const window = {
    loadFile: loadFile ?? sinon.stub().resolves(),
    center: sinon.spy(),
    destroy: sinon.spy()
  }
  const createSplashScreen = proxyquire('../../src/splash/create-splash-screen', {
    electron: {
      BrowserWindow: construct ?? sinon.stub().returns(window)
    },
    '../context': () => ctx,
    '../common/logger': { error: sinon.spy(), info: sinon.spy() }
  })

  return { createSplashScreen, ctx, window }
}

test.describe('Splash screen', () => {
  test('publishes the window once it loaded', async () => {
    const { createSplashScreen, ctx, window } = setup({})

    await createSplashScreen()

    expect(window.center.callCount).toEqual(1)
    expect(ctx.setProp.calledOnceWith('splashScreen', window)).toBe(true)
  })

  test('publishes null when the page fails to load', async () => {
    const loadFile = sinon.stub().rejects(new Error('ENOENT'))
    const { createSplashScreen, ctx, window } = setup({ loadFile })

    await createSplashScreen()

    // Anything awaiting the prop (setupWebUI, the error path in index.js)
    // blocks until it is set, so a failure has to publish too.
    expect(ctx.setProp.calledOnceWith('splashScreen', null)).toBe(true)
    expect(window.destroy.callCount).toEqual(1)
  })

  test('publishes null when the window cannot be created', async () => {
    const construct = sinon.stub().throws(new Error('no display'))
    const { createSplashScreen, ctx } = setup({ construct })

    await createSplashScreen()

    expect(ctx.setProp.calledOnceWith('splashScreen', null)).toBe(true)
  })
})
