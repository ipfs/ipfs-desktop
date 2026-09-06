const proxyquire = require('proxyquire').noCallThru()
const { test, expect } = require('@playwright/test')

function deferred () {
  let release
  const promise = new Promise(resolve => {
    release = resolve
  })
  return { promise, resolve: release }
}

test('configures daemon flags before starting the daemon', async () => {
  const autoGc = deferred()
  const pubsub = deferred()
  const namesysPubsub = deferred()
  const finished = deferred()
  const calls = []
  const handleError = () => {}
  const noop = () => {}
  const asyncNoop = async () => {}
  const app = {
    setPath: noop,
    setAppUserModelId: noop,
    requestSingleInstanceLock: () => true,
    on: noop,
    whenReady: asyncNoop
  }
  const webui = {
    webContents: {
      isLoading: () => false
    }
  }
  const gatedSetup = (name, gate) => async () => {
    calls.push(`${name}:start`)
    await gate.promise
    calls.push(`${name}:done`)
  }

  try {
    proxyquire('../../src/index', {
      './metrics/appStart': {
        registerAppStartTime: noop,
        getSecondsSinceAppStart: () => 0
      },
      'v8-compile-cache': {},
      electron: {
        app,
        dialog: { showErrorBox: noop }
      },
      './context': () => ({ getProp: async () => webui }),
      'fix-path': noop,
      './common/logger': {
        addAnalyticsEvent: () => finished.resolve()
      },
      './protocol-handlers': noop,
      './i18n': asyncNoop,
      './daemon': () => calls.push('daemon'),
      './webui': asyncNoop,
      './auto-launch': asyncNoop,
      './automatic-gc': gatedSetup('automatic-gc', autoGc),
      './enable-pubsub': gatedSetup('pubsub', pubsub),
      './enable-namesys-pubsub': gatedSetup('namesys-pubsub', namesysPubsub),
      './take-screenshot': asyncNoop,
      './app-menu': asyncNoop,
      './argv-files-handler': asyncNoop,
      './auto-updater': asyncNoop,
      './tray': asyncNoop,
      './analytics': asyncNoop,
      './cid-profile': asyncNoop,
      './provide-strategy': asyncNoop,
      './second-instance': asyncNoop,
      './analytics/keys': { analyticsKeys: { APP_READY: 'app-ready' } },
      './handleError': handleError,
      './splash/create-splash-screen': asyncNoop
    })

    await new Promise(resolve => setImmediate(resolve))
    expect(calls).not.toContain('daemon')

    autoGc.resolve()
    pubsub.resolve()
    namesysPubsub.resolve()
    await finished.promise

    const daemonIndex = calls.indexOf('daemon')
    expect(daemonIndex).toBeGreaterThan(calls.indexOf('automatic-gc:done'))
    expect(daemonIndex).toBeGreaterThan(calls.indexOf('pubsub:done'))
    expect(daemonIndex).toBeGreaterThan(calls.indexOf('namesys-pubsub:done'))
  } finally {
    autoGc.resolve()
    pubsub.resolve()
    namesysPubsub.resolve()
    process.removeListener('uncaughtException', handleError)
    process.removeListener('unhandledRejection', handleError)
  }
})
