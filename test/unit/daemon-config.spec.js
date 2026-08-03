const { join } = require('path')
const { test, expect } = require('@playwright/test')

const fs = require('fs-extra')
const tmp = require('tmp')
const proxyquire = require('proxyquire').noCallThru()

const mockLogger = require('./mocks/logger')
const { makeRepository } = require('./../e2e/utils/ipfsd')
const { detectCurrentStrategy } = require('../../src/provide-strategy')
const { detectCurrentProfile } = require('../../src/cid-profile')

if (process.env.CI === 'true') test.setTimeout(120000) // slow ci

// migrateConfig persists the revision it reached, so it runs against a stub
// instead of the real store: the developer's own daemonConfigRevision would
// otherwise make every run after the first a no-op.
function loadMigrateConfig (revision) {
  const values = new Map()
  if (revision !== undefined) values.set('daemonConfigRevision', revision)

  const { migrateConfig } = proxyquire('../../src/daemon/config', {
    '../common/store': {
      get: (key, fallback) => values.has(key) ? values.get(key) : fallback,
      set: (key, value) => values.set(key, value),
      safeSet: (key, value) => values.set(key, value)
    },
    '../common/logger': mockLogger()
  })

  return { migrateConfig, values }
}

// tmp drops its directories at exit only once someone arms graceful cleanup,
// so hold on to the callbacks and remove them by hand.
const tmpRepos = []

// Stands in for the ipfsd controller: both config writers only read .path.
function repoWithConfig (config) {
  const { name: path, removeCallback } = tmp.dirSync({ prefix: 'tmp_IPFS_PATH_', unsafeCleanup: true })
  tmpRepos.push(removeCallback)
  fs.writeJsonSync(join(path, 'config'), config, { spaces: 2 })
  return { path }
}

const readConfig = (ipfsd) => fs.readJsonSync(join(ipfsd.path, 'config'))

// An IPFS Desktop repo from before the Provide defaults landed. Addresses are
// there because the older migrations read the gateway port.
const legacyConfig = () => ({
  Addresses: {
    API: '/ip4/127.0.0.1/tcp/5001',
    Gateway: '/ip4/127.0.0.1/tcp/8080'
  },
  API: { HTTPHeaders: {} },
  Discovery: { MDNS: { Enabled: true } },
  Swarm: { ConnMgr: {} }
})

test.describe('applyDefaults', function () {
  let ipfsd, config

  test.beforeAll(async () => {
    // Runs `ipfs init` and then applyDefaults, the pair src/daemon/daemon.js
    // runs for a repo IPFS Desktop creates. No daemon needed.
    const repo = await makeRepository({ start: false })
    ipfsd = repo.ipfsd
    config = fs.readJsonSync(repo.configPath)
  })

  test.afterAll(async () => {
    if (ipfsd) await ipfsd.stop()
  })

  // What we write has to classify as a named entry. Anything else reconciles
  // to 'manual' on first start, and the tray then renders the submenu
  // read-only for a config IPFS Desktop wrote itself.
  test('writes a provide strategy the tray can name', () => {
    expect(detectCurrentStrategy(config.Provide.Strategy)).toEqual('pinned+mfs+unique')
  })

  test('writes a cid profile the tray can name', () => {
    expect(detectCurrentProfile(config.Import)).toEqual('unixfs-v1-2025')
  })

  test('writes the fast provide preferences explicitly', () => {
    expect(config.Import.FastProvideRoot).toEqual(true)
    expect(config.Import.FastProvideDAG).toEqual(true)
    expect(config.Import.FastProvideWait).toEqual(false)
  })
})

test.describe('migrateConfig', function () {
  test.afterAll(() => {
    tmpRepos.forEach(remove => remove())
  })

  test('gives an old repo the provide defaults', () => {
    const { migrateConfig, values } = loadMigrateConfig()
    const ipfsd = repoWithConfig(legacyConfig())

    migrateConfig(ipfsd)

    const config = readConfig(ipfsd)
    expect(detectCurrentStrategy(config.Provide.Strategy)).toEqual('pinned+mfs+unique')
    expect(config.Import.FastProvideRoot).toEqual(true)
    expect(config.Import.FastProvideDAG).toEqual(true)
    expect(config.Import.FastProvideWait).toEqual(false)
    expect(values.get('daemonConfigRevision')).toEqual(8)
  })

  // Revision 7 set Provide.Strategy on its own. `ipfs init` leaves the
  // FastProvide keys as nulls, which is the shape the fill-in has to see
  // through.
  test('fills in what revision 7 left out', () => {
    const { migrateConfig } = loadMigrateConfig(7)
    const ipfsd = repoWithConfig({
      ...legacyConfig(),
      Provide: { Strategy: 'pinned+mfs+unique' },
      Import: { CidVersion: null, FastProvideRoot: null, FastProvideDAG: null, FastProvideWait: null }
    })

    migrateConfig(ipfsd)

    const config = readConfig(ipfsd)
    expect(config.Import.FastProvideRoot).toEqual(true)
    expect(config.Import.FastProvideDAG).toEqual(true)
    expect(config.Import.FastProvideWait).toEqual(false)
  })

  test('keeps a fast provide preference the user set', () => {
    const { migrateConfig } = loadMigrateConfig(7)
    const ipfsd = repoWithConfig({
      ...legacyConfig(),
      Import: { FastProvideDAG: false }
    })

    migrateConfig(ipfsd)

    const config = readConfig(ipfsd)
    expect(config.Import.FastProvideDAG).toEqual(false)
    expect(config.Import.FastProvideRoot).toEqual(true)
    expect(config.Import.FastProvideWait).toEqual(false)
  })
})
