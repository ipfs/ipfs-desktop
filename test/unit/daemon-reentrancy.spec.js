const { EventEmitter } = require('events')
const { test, expect } = require('@playwright/test')
const ipcMainEvents = require('../../src/common/ipc-main-events')

const proxyquire = require('proxyquire')
  .noCallThru()
  .noPreserveCache()

function deferred () {
  let release
  const promise = new Promise(resolve => { release = resolve })
  return { promise, resolve: release }
}

function setup () {
  const noop = () => {}
  const ipcMain = new EventEmitter()
  const starts = []
  const stops = []
  let inFlight = 0
  let peak = 0

  // Hands back one gate per start so the test can hold a daemon mid-launch.
  const createDaemon = async () => {
    const gate = deferred()
    starts.push(gate)
    inFlight++
    peak = Math.max(peak, inFlight)
    try {
      await gate.promise
      return {
        err: null,
        id: `peer-${starts.length}`,
        ipfsd: {
          path: '/repo',
          stop: async () => {
            const stopGate = deferred()
            stops.push(stopGate)
            await stopGate.promise
          }
        }
      }
    } finally {
      inFlight--
    }
  }

  const setupDaemon = proxyquire('../../src/daemon/index', {
    electron: { app: { on: noop }, ipcMain },
    'fs-extra': { pathExistsSync: () => true },
    '../dialogs': { ipfsNotRunningDialog: async () => {} },
    '../common/store': { get: () => ({ path: '/repo', flags: [] }), safeSet: noop },
    '../common/logger': {
      start: () => ({ end: noop, fail: noop }),
      info: noop,
      error: noop
    },
    './daemon': createDaemon,
    '../context': () => ({ setProp: noop })
  })

  return { setupDaemon, ipcMain, starts, stops, peak: () => peak }
}

const settle = () => new Promise(resolve => setImmediate(resolve))

test.describe('Daemon transitions', () => {
  test('a config change mid-start does not launch a second daemon', async () => {
    const { setupDaemon, ipcMain, starts, stops, peak } = setup()

    const ready = setupDaemon()
    await settle()
    expect(starts.length).toEqual(1)

    // The repo lock is held by a Kubo that has not reported back yet, so this
    // restart must not spawn another one alongside it.
    ipcMain.emit(ipcMainEvents.IPFS_CONFIG_CHANGED)
    await settle()
    expect(starts.length).toEqual(1)
    expect(peak()).toEqual(1)

    starts[0].resolve()
    await ready
    await settle()

    // The restart still happens, just afterwards: stop the first, start again.
    expect(stops.length).toEqual(1)
    stops[0].resolve()
    await settle()
    expect(starts.length).toEqual(2)
    expect(peak()).toEqual(1)
  })

  test('overlapping restarts never run two daemons at once', async () => {
    const { setupDaemon, ipcMain, starts, stops, peak } = setup()

    const ready = setupDaemon()
    await settle()
    starts[0].resolve()
    await ready

    ipcMain.emit(ipcMainEvents.IPFS_CONFIG_CHANGED)
    ipcMain.emit(ipcMainEvents.IPFS_CONFIG_CHANGED)
    await settle()

    // Drain whatever the restarts queued up, one transition at a time.
    for (let i = 0; i < 8; i++) {
      stops.filter(g => !g.done).forEach(g => { g.done = true; g.resolve() })
      starts.filter(g => !g.done).forEach(g => { g.done = true; g.resolve() })
      await settle()
    }

    expect(peak()).toEqual(1)
  })
})
