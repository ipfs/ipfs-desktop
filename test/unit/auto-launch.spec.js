const proxyquire = require('proxyquire').noCallThru()
const { test, expect } = require('@playwright/test')

const appState = { appPath: '' }
const electronMock = {
  app: {
    getAppPath: () => appState.appPath
  }
}

const { quoteDesktopEntryArg, getLinuxAutostartExec } = proxyquire('../../src/auto-launch', {
  electron: electronMock,
  './utils/create-toggler': () => {},
  './common/logger': { info: () => {}, error: () => {} },
  './common/store': { get: () => false, set: () => {} },
  './common/consts': { IS_MAC: false, IS_WIN: false },
  './common/config-keys': { AUTO_LAUNCH: 'AUTO_LAUNCH' },
  './dialogs': { showDialog: () => {}, recoverableErrorDialog: () => {} }
})

function withEnv ({ execPath, appPath }, fn) {
  const previousExecPath = process.execPath
  process.execPath = execPath
  appState.appPath = appPath
  try {
    return fn()
  } finally {
    process.execPath = previousExecPath
  }
}

test.describe('quoteDesktopEntryArg (Desktop Entry Exec= spec)', () => {
  test('wraps a simple path in double quotes', () => {
    expect(quoteDesktopEntryArg('/usr/bin/ipfs-desktop')).toBe('"/usr/bin/ipfs-desktop"')
  })

  test('preserves spaces inside the surrounding quotes', () => {
    expect(quoteDesktopEntryArg('/opt/My Apps/electron39'))
      .toBe('"/opt/My Apps/electron39"')
  })

  test('escapes literal backslash', () => {
    expect(quoteDesktopEntryArg('a\\b')).toBe('"a\\\\b"')
  })

  test('escapes literal double quote', () => {
    expect(quoteDesktopEntryArg('a"b')).toBe('"a\\"b"')
  })

  test('escapes literal dollar sign', () => {
    expect(quoteDesktopEntryArg('a$b')).toBe('"a\\$b"')
  })

  test('escapes literal backtick', () => {
    expect(quoteDesktopEntryArg('a`b')).toBe('"a\\`b"')
  })

  test('escapes every reserved character in a single pass', () => {
    expect(quoteDesktopEntryArg('a\\b"c$d`e'))
      .toBe('"a\\\\b\\"c\\$d\\`e"')
  })
})

test.describe('getLinuxAutostartExec', () => {
  test('AUR / system electron39: appends the app.asar path', () => {
    // Real-world AUR layout: /usr/bin/ipfs-desktop wrapper execs
    // `electron39 /usr/lib/ipfs-desktop/app.asar`, so process.execPath ends up
    // pointing at the system electron and getAppPath() returns the asar path.
    const result = withEnv({
      execPath: '/usr/bin/electron39',
      appPath: '/usr/lib/ipfs-desktop/resources/app.asar'
    }, getLinuxAutostartExec)

    expect(result).toBe('"/usr/bin/electron39" "/usr/lib/ipfs-desktop/resources/app.asar"')
  })

  test('AUR with unversioned electron binary name: still appends app path', () => {
    const result = withEnv({
      execPath: '/usr/bin/electron',
      appPath: '/usr/lib/ipfs-desktop/resources/app.asar'
    }, getLinuxAutostartExec)

    expect(result).toBe('"/usr/bin/electron" "/usr/lib/ipfs-desktop/resources/app.asar"')
  })

  test('bundled electron-builder build: keeps a single argument', () => {
    // Bundled tarball / .deb: process.execPath is the rebranded electron
    // binary named after the app, so the basename does not start with
    // "electron" and we must not append the asar path.
    const result = withEnv({
      execPath: '/opt/IPFS Desktop/ipfs-desktop',
      appPath: '/opt/IPFS Desktop/resources/app.asar'
    }, getLinuxAutostartExec)

    expect(result).toBe('"/opt/IPFS Desktop/ipfs-desktop"')
  })

  test('AppImage runtime mount: keeps a single argument', () => {
    const result = withEnv({
      execPath: '/tmp/.mount_IPFSdeXYZ/ipfs-desktop',
      appPath: '/tmp/.mount_IPFSdeXYZ/resources/app.asar'
    }, getLinuxAutostartExec)

    expect(result).toBe('"/tmp/.mount_IPFSdeXYZ/ipfs-desktop"')
  })

  test('does not duplicate the path when appPath equals execPath', () => {
    const result = withEnv({
      execPath: '/usr/bin/electron39',
      appPath: '/usr/bin/electron39'
    }, getLinuxAutostartExec)

    expect(result).toBe('"/usr/bin/electron39"')
  })

  test('falls back to execPath alone when appPath is empty', () => {
    const result = withEnv({
      execPath: '/usr/bin/electron39',
      appPath: ''
    }, getLinuxAutostartExec)

    expect(result).toBe('"/usr/bin/electron39"')
  })

  test('escapes Desktop Entry reserved characters in either argument', () => {
    const result = withEnv({
      execPath: '/usr/bin/electron39',
      appPath: '/srv/$weird/`path`/app.asar'
    }, getLinuxAutostartExec)

    expect(result).toBe('"/usr/bin/electron39" "/srv/\\$weird/\\`path\\`/app.asar"')
  })
})
