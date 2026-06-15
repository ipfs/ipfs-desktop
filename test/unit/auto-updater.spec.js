const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const { test, expect } = require('@playwright/test')
const { EventEmitter } = require('events')

// These tests cover the error-dialog gating in src/auto-updater. The module
// registers electron-updater event handlers and decides whether an error is
// worth a modal dialog. The rule: stay silent on transient errors during
// background checks, but surface errors from manual checks or once a download
// has started.
//
// We drive the real public entrypoint with a fake electron-updater that is an
// EventEmitter, then emit the events electron-updater would emit and assert on
// the dialog. `feedback` (manual-check mode) is reached through the same
// `manualCheckForUpdates` trigger the About menu uses.

function loadUpdater () {
  const fakeAutoUpdater = Object.assign(new EventEmitter(), {
    checkForUpdates: sinon.stub().resolves(),
    downloadUpdate: sinon.stub().resolves(),
    quitAndInstall: sinon.stub()
  })

  const showDialog = sinon.stub().returns(0) // default: "Later"
  const shellOpenExternal = sinon.spy()
  const notifications = []
  class FakeNotification {
    constructor (opts) {
      this.opts = opts
      this.on = sinon.spy()
      this.show = sinon.spy()
      notifications.push(this)
    }
  }

  const ctxProps = {}
  const fakeCtx = {
    getFn: () => sinon.stub().resolves(0),
    setProp: (key, value) => { ctxProps[key] = value },
    getProp: (key) => ctxProps[key]
  }

  const updater = proxyquire('../../src/auto-updater', {
    electron: {
      shell: { openExternal: shellOpenExternal },
      app: { removeAllListeners: sinon.spy() },
      BrowserWindow: { getAllWindows: () => [] },
      Notification: FakeNotification,
      ipcMain: { emit: sinon.spy() },
      autoUpdater: { on: sinon.spy() } // electron's built-in updater (before-quit-for-update)
    },
    'electron-updater': { autoUpdater: fakeAutoUpdater },
    i18next: { t: (key) => key },
    '../common/logger': { info: () => {}, error: () => {} },
    '../dialogs': { showDialog },
    '../common/consts': { IS_MAC: true, IS_WIN: false, IS_APPIMAGE: false },
    '../common/ipc-main-events': { UPDATING: 'updating', UPDATING_ENDED: 'updating-ended' },
    '../context': () => fakeCtx,
    '../common/store': { get: () => false },
    '../common/config-keys': { DISABLE_AUTO_UPDATE: 'disableAutoUpdate' }
  })

  return { updater, fakeAutoUpdater, showDialog, shellOpenExternal, notifications, ctxProps }
}

// Run the real init in the supported-platform path so the event handlers and
// the manual-check trigger get wired. NODE_ENV is forced off 'test' (which
// otherwise short-circuits init), and the 12h setInterval is neutralised so it
// does not keep the worker alive.
async function initSupported (h) {
  const setIntervalStub = sinon.stub(global, 'setInterval')
  const prevEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'
  try {
    await h.updater()
    await new Promise(resolve => setImmediate(resolve)) // let the startup check settle
  } finally {
    process.env.NODE_ENV = prevEnv
    setIntervalStub.restore()
  }
}

const tick = () => new Promise(resolve => setImmediate(resolve))

test.describe('auto-updater error dialog gating', () => {
  test('background-check error stays silent', async () => {
    const h = loadUpdater()
    await initSupported(h)

    h.fakeAutoUpdater.emit('error', new Error('network not ready after wake'))

    expect(h.showDialog.called).toBe(false)
  })

  test('error while a download is in flight shows the dialog', async () => {
    const h = loadUpdater()
    await initSupported(h)

    h.fakeAutoUpdater.emit('update-available', { version: '1.2.3' }) // sets updateStarted = true
    await tick()
    h.fakeAutoUpdater.emit('error', new Error('download failed'))

    expect(h.showDialog.calledOnce).toBe(true)
  })

  test('error after a completed download stays silent', async () => {
    // Regression guard: updateStarted must be cleared on update-downloaded, so a
    // later transient background error after a finished download is not surfaced.
    const h = loadUpdater()
    await initSupported(h)

    h.fakeAutoUpdater.emit('update-available', { version: '1.2.3' }) // updateStarted = true
    await tick()
    h.fakeAutoUpdater.emit('update-downloaded', { version: '1.2.3' }) // updateStarted = false
    h.fakeAutoUpdater.emit('error', new Error('later transient error'))

    expect(h.showDialog.called).toBe(false)
  })

  test('manual-check error shows the dialog', async () => {
    const h = loadUpdater()
    await initSupported(h)

    h.ctxProps.manualCheckForUpdates() // feedback = true
    h.fakeAutoUpdater.emit('error', new Error('manual check failed'))

    expect(h.showDialog.calledOnce).toBe(true)
  })

  test('a shown error resets feedback so the next background error is silent', async () => {
    const h = loadUpdater()
    await initSupported(h)

    h.ctxProps.manualCheckForUpdates() // feedback = true
    h.fakeAutoUpdater.emit('error', new Error('first, manual')) // shown, resets feedback
    h.fakeAutoUpdater.emit('error', new Error('second, background')) // silent

    expect(h.showDialog.calledOnce).toBe(true)
  })

  test('choosing "Download Now" on an error opens the releases page', async () => {
    const h = loadUpdater()
    await initSupported(h)
    h.showDialog.returns(1) // "Download Now"

    h.ctxProps.manualCheckForUpdates()
    h.fakeAutoUpdater.emit('error', new Error('boom'))

    expect(h.shellOpenExternal.calledOnceWith('https://github.com/ipfs/ipfs-desktop/releases/latest')).toBe(true)
  })
})
