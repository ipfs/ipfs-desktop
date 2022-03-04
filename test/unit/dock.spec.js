const sinon = require('sinon')
const { test, expect } = require('@playwright/test')
const mockElectron = require('./mocks/electron')

const proxyquire = require('proxyquire')
  .noCallThru()
  .noPreserveCache()

test.describe('Dock', () => {
  test('show dock succeeds with dock (macOS)', () => {
    const electron = mockElectron({ withDock: true })
    const { show } = proxyquire('../../src/utils/dock', { electron })
    show()
    expect(electron.app.dock.show.callCount).toEqual(1)
  })

  test('show dock succeeds without dock (other OSes)', () => {
    const electron = mockElectron()
    const { show } = proxyquire('../../src/utils/dock', { electron })
    show()
  })

  test('hide dock succeeds with dock and no windows (macOS)', () => {
    const electron = mockElectron({ withDock: true })
    electron.BrowserWindow.getAllWindows.returns([])
    const { hide } = proxyquire('../../src/utils/dock', { electron })
    hide()
    expect(electron.app.dock.hide.callCount).toEqual(1)
  })

  test('hide dock succeeds with dock and no visible windows (macOS)', () => {
    const electron = mockElectron({ withDock: true })
    const windows = [
      { isVisible: sinon.stub().returns(false) },
      { isVisible: sinon.stub().returns(false) }
    ]
    electron.BrowserWindow.getAllWindows.returns(windows)
    const { hide } = proxyquire('../../src/utils/dock', { electron })
    hide()
    expect(windows[0].isVisible.callCount).toEqual(1)
    expect(windows[1].isVisible.callCount).toEqual(1)
    expect(electron.app.dock.hide.callCount).toEqual(1)
  })

  test('hide dock succeeds with dock and with visible windows (macOS)', () => {
    const electron = mockElectron({ withDock: true })
    const windows = [
      { isVisible: sinon.stub().returns(true) },
      { isVisible: sinon.stub().returns(false) }
    ]
    electron.BrowserWindow.getAllWindows.returns(windows)
    const { hide } = proxyquire('../../src/utils/dock', { electron })
    hide()
    expect(windows[0].isVisible.callCount).toEqual(1)
    expect(windows[1].isVisible.callCount).toEqual(1)
    expect(electron.app.dock.hide.callCount).toEqual(0)
  })

  test('hide dock succeeds without dock (other OSes)', () => {
    const electron = mockElectron()
    const { hide } = proxyquire('../../src/utils/dock', { electron })
    hide()
  })

  test('runs async function with dock (macOS)', async () => {
    const electron = mockElectron({ withDock: true })
    electron.BrowserWindow.getAllWindows.returns([])
    const { run } = proxyquire('../../src/utils/dock', { electron })
    const fn = sinon.stub().resolves(5)
    const res = await run(fn)
    expect(res).toEqual(5)
    expect(electron.app.dock.show.callCount).toEqual(1)
    expect(electron.app.dock.hide.callCount).toEqual(1)
    expect(electron.app.dock.show.calledBefore(electron.app.dock.hide)).toEqual(true)
  })

  test('runs async function without dock (other OSes)', async () => {
    const electron = mockElectron()
    electron.BrowserWindow.getAllWindows.returns([])
    const { run } = proxyquire('../../src/utils/dock', { electron })
    const fn = sinon.stub().resolves(5)
    const res = await run(fn)
    expect(res).toEqual(5)
  })

  test('runs sync function with dock (macOS)', () => {
    const electron = mockElectron({ withDock: true })
    electron.BrowserWindow.getAllWindows.returns([])
    const { runSync } = proxyquire('../../src/utils/dock', { electron })
    const fn = sinon.stub().returns(5)
    const res = runSync(fn)
    expect(res).toEqual(5)
    expect(electron.app.dock.show.callCount).toEqual(1)
    expect(electron.app.dock.hide.callCount).toEqual(1)
    expect(electron.app.dock.show.calledBefore(electron.app.dock.hide)).toEqual(true)
  })

  test('runs sync function without dock (other OSes)', () => {
    const electron = mockElectron()
    electron.BrowserWindow.getAllWindows.returns([])
    const { runSync } = proxyquire('../../src/utils/dock', { electron })
    const fn = sinon.stub().returns(5)
    const res = runSync(fn)
    expect(res).toEqual(5)
  })
})
