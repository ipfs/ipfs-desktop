const { _electron: electron } = require('playwright')
const { test, expect } = require('@playwright/test')

const path = require('path')
const fs = require('fs-extra')
const tmp = require('tmp')
const { makeRepository } = require('./utils/ipfsd')
const portfinder = require('portfinder')

async function getPort (port) {
  return portfinder.getPortPromise({ port })
}

if (process.env.CI === 'true') test.setTimeout(120000) // slow ci

test.describe.serial('Application launch', async () => {
  let app = null

  test.afterEach(async () => {
    if (!app) return
    // app.close() waits for `before-quit` -> ipfsd.stop(), which can hang on
    // slow ci runners (especially when the test left ipfsd in a broken state,
    // e.g. kubo killed by a version-mismatch error). Race it against a short
    // deadline and fall back to SIGKILL so the rest of the suite can proceed.
    const current = app
    app = null
    try {
      await Promise.race([
        current.close(),
        new Promise((resolve, reject) => setTimeout(() => reject(new Error('app.close() timeout')), 15000))
      ])
    } catch (e) {
      if (e.message.includes('has been closed')) return
      try {
        const proc = current.process()
        if (proc && !proc.killed) proc.kill('SIGKILL')
      } catch {}
      // After SIGKILL, let Playwright observe the subprocess exit and release
      // its CDP resources. Without this, worker teardown inherits a
      // half-closed connection and hits its own 30s deadline on windows.
      try {
        await Promise.race([
          current.close().catch(() => {}),
          new Promise(resolve => setTimeout(resolve, 10000))
        ])
      } catch {}
    }
  })

  /**
   *
   * @param {Object} [param0]
   * @param {string} param0.repoPath
   * @returns {Promise<{ app: Awaited<ReturnType<import('playwright')._electron['launch']>>, repoPath: string, home: string }>
   */
  async function startApp ({ repoPath } = {}) {
    const home = tmp.dirSync({ prefix: 'tmp_home_', unsafeCleanup: true }).name
    if (!repoPath) {
      repoPath = path.join(home, '.ipfs')
    }
    app = await electron.launch({
      args: [path.join(__dirname, '../../src/index.js')],
      env: Object.assign({}, process.env, {
        NODE_ENV: 'test',
        HOME: home,
        IPFS_PATH: repoPath
      })
    })
    return { app, repoPath, home }
  }

  /**
   *
   * @param {Awaited<ReturnType<import('playwright')._electron['launch']>>} app
   * @returns {Promise<{ peerId: string }>
   */
  async function daemonReady (app) {
    const peerId = await app.evaluate(async ({ ipcMain }) => new Promise((resolve, reject) => {
      ipcMain.on('ipfsd', (status, peerId) => {
        switch (status) {
          // NOTE: this code runs inside the main process of electron, so we cannot use
          // things we've imported outside of this function. The hard coded values can be
          // found in src/daemon/consts.js.
          case 3:
            reject(new Error('starting daemon failed'))
            break
          case 2:
            resolve(peerId)
            break
        }
      })
    }))

    return { peerId }
  }

  test('creates a repository on startup', async () => {
    const { app, repoPath } = await startApp({})
    const { peerId } = await daemonReady(app)
    // expect config to be created and match peerId
    const configPath = path.join(repoPath, 'config')
    const config = fs.readJsonSync(configPath)
    expect(config).toBeDefined()
    // confirm PeerID is matching one from repoPath/config
    expect(config.Identity.PeerID).toBe(peerId)
    // ensure strict CORS checking is enabled
    expect(config.API.HTTPHeaders).toEqual({})
    expect(config.Discovery.MDNS.Enabled).toBeTruthy()
  })

  test('starts fine when node is already running', async () => {
    const { ipfsd, repoPath } = await makeRepository({ start: true })
    const { app } = await startApp({ repoPath })
    const { peerId } = await daemonReady(app)
    const { id: expectedId } = await ipfsd.api.id()
    expect(peerId).toBe(expectedId)
  })

  test('applies config migration (MDNS.enabled)', async () => {
    // create preexisting, initialized repo and config
    const { repoPath, configPath, peerId: expectedId } = await makeRepository({ start: false })

    // setup "broken" config for the test
    const initConfig = fs.readJsonSync(configPath)
    // simulate bug from https://github.com/ipfs-shipyard/ipfs-desktop/issues/1631
    delete initConfig.Discovery.MDNS.Enabled
    initConfig.Discovery.MDNS.enabled = true
    fs.writeJsonSync(configPath, initConfig, { spaces: 2 })

    const { app } = await startApp({ repoPath })
    const { peerId } = await daemonReady(app)
    expect(peerId).toBe(expectedId)

    const config = fs.readJsonSync(configPath)
    // ensure app has migrated config
    expect(config.Discovery.MDNS.enabled).toBeUndefined()
    expect(config.Discovery.MDNS.Enabled).toBeTruthy()
  })

  test('applies config migration (Web UI CORS 1)', async () => {
    // create preexisting, initialized repo and config
    const { repoPath, configPath, peerId: expectedId } = await makeRepository({ start: false })

    const initConfig = fs.readJsonSync(configPath)
    initConfig.API.HTTPHeaders['Access-Control-Allow-Origin'] = ['https://127.0.0.1:4040']
    fs.writeJsonSync(configPath, initConfig, { spaces: 2 })

    const { app } = await startApp({ repoPath })
    const { peerId } = await daemonReady(app)
    expect(peerId).toBe(expectedId)

    const config = fs.readJsonSync(configPath)
    // ensure app has migrated config
    expect(config.API.HTTPHeaders['Access-Control-Allow-Origin']).toEqual([
      'https://127.0.0.1:4040',
      'https://webui.ipfs.io',
      'http://webui.ipfs.io.ipns.localhost:0' // ipfsd 'test' profile uses '/ip4/127.0.0.1/tcp/0'
    ])
  })

  test('applies config migration (Web UI CORS 2)', async () => {
    // create preexisting, initialized repo and config
    const { repoPath, configPath, peerId: expectedId } = await makeRepository({ start: false })

    const initConfig = fs.readJsonSync(configPath)
    initConfig.API.HTTPHeaders['Access-Control-Allow-Origin'] = []
    fs.writeJsonSync(configPath, initConfig, { spaces: 2 })

    const { app } = await startApp({ repoPath })
    const { peerId } = await daemonReady(app)
    expect(peerId).toBe(expectedId)

    const config = fs.readJsonSync(configPath)
    // ensure app has migrated config
    expect(config.API.HTTPHeaders['Access-Control-Allow-Origin']).toEqual([
      'https://webui.ipfs.io',
      'http://webui.ipfs.io.ipns.localhost:0' // ipfsd 'test' profile uses '/ip4/127.0.0.1/tcp/0'
    ])
  })

  test('applies config migration (Web UI CORS 3)', async () => {
    // create preexisting, initialized repo and config
    const { repoPath, configPath, peerId: expectedId } = await makeRepository({ start: false })

    const initConfig = fs.readJsonSync(configPath)
    delete initConfig.API.HTTPHeaders
    fs.writeJsonSync(configPath, initConfig, { spaces: 2 })

    const { app } = await startApp({ repoPath })
    const { peerId } = await daemonReady(app)
    expect(peerId).toBe(expectedId)

    const config = fs.readJsonSync(configPath)
    // ensure app has migrated config
    expect(config.API.HTTPHeaders['Access-Control-Allow-Origin']).toEqual([
      'https://webui.ipfs.io',
      'http://webui.ipfs.io.ipns.localhost:0' // ipfsd 'test' profile uses '/ip4/127.0.0.1/tcp/0'
    ])
  })

  test('applies config migration v4 (old custom ConnMgr)', async () => {
    // create preexisting, initialized repo and config
    const { repoPath, configPath, peerId: expectedId } = await makeRepository({ start: false })

    const initConfig = fs.readJsonSync(configPath)
    initConfig.Swarm.ConnMgr.GracePeriod = '300s'
    initConfig.Swarm.ConnMgr.LowWater = 50
    initConfig.Swarm.ConnMgr.HighWater = 300
    fs.writeJsonSync(configPath, initConfig, { spaces: 2 })

    const { app } = await startApp({ repoPath })
    const { peerId } = await daemonReady(app)
    expect(peerId).toBe(expectedId)

    const config = fs.readJsonSync(configPath)
    // ensure app has migrated config to v5 instead of v4
    expect(config.Swarm.ConnMgr.GracePeriod).toEqual(undefined)
    expect(config.Swarm.ConnMgr.LowWater).toEqual(undefined)
    expect(config.Swarm.ConnMgr.HighWater).toEqual(undefined)
  })

  test('applies config migration v5 (switch to implicit defaults from Kubo 0.18)', async () => {
    // create preexisting, initialized repo and config
    const { repoPath, configPath, peerId: expectedId } = await makeRepository({ start: false })

    const initConfig = fs.readJsonSync(configPath)
    initConfig.Swarm.ConnMgr.GracePeriod = '1m'
    initConfig.Swarm.ConnMgr.LowWater = 20
    initConfig.Swarm.ConnMgr.HighWater = 40
    fs.writeJsonSync(configPath, initConfig, { spaces: 2 })

    const { app } = await startApp({ repoPath })
    const { peerId } = await daemonReady(app)
    expect(peerId).toBe(expectedId)

    const config = fs.readJsonSync(configPath)
    // ensure app has migrated config
    expect(config.Swarm.ConnMgr.GracePeriod).toEqual(undefined)
    expect(config.Swarm.ConnMgr.LowWater).toEqual(undefined)
    expect(config.Swarm.ConnMgr.HighWater).toEqual(undefined)
  })

  // IPFS Desktop has explicit AutoTLS.Enabled=true from the start, to skip AutoTLS.RegistrationDelay
  test('repo init sets explicit AutoTLS.Enabled=true', async () => {
    // create preexisting, initialized repo and config
    const { repoPath, configPath, peerId: expectedId } = await makeRepository({ start: false })

    // just read config (it should have empty AutoTLS config)
    const initConfig = fs.readJsonSync(configPath)
    fs.writeJsonSync(configPath, initConfig, { spaces: 2 })

    const { app } = await startApp({ repoPath })
    const { peerId } = await daemonReady(app)
    expect(peerId).toBe(expectedId)

    const config = fs.readJsonSync(configPath)
    // ensure ipfs-desktop migrated default Kubo config to explicitly enable AutoTLS
    expect(config.AutoTLS.Enabled).toEqual(true)
  })

  test('starts with repository with "IPFS_PATH/api" file and no daemon running', async () => {
    // create "remote" repo
    const { ipfsd } = await makeRepository({ start: true })

    // create "local" repo
    const { repoPath, configPath } = await makeRepository({ start: false })
    fs.unlinkSync(configPath) // remove config file to ensure local repo can't be used

    // create IPFS_PATH/api file to point at remote node
    const apiPath = path.join(repoPath, 'api')
    fs.writeFile(apiPath, ipfsd.apiAddr.toString())

    const { app } = await startApp({ repoPath })
    await daemonReady(app)
  })

  test('starts with multiple api addresses', async () => {
    const { repoPath, configPath } = await makeRepository({ start: false })
    const config = fs.readJsonSync(configPath)
    config.Addresses.API = [
      `/ip4/127.0.0.1/tcp/${await getPort(5001)}`,
      `/ip4/127.0.0.1/tcp/${await getPort(5002)}`
    ]
    fs.writeJsonSync(configPath, config, { spaces: 2 })
    const { app } = await startApp({ repoPath })
    await daemonReady(app)
  })

  test('starts with multiple gateway addresses', async () => {
    const { repoPath, configPath } = await makeRepository({ start: false })
    const config = fs.readJsonSync(configPath)
    config.Addresses.Gateway = [
      `/ip4/127.0.0.1/tcp/${await getPort(8080)}`,
      `/ip4/127.0.0.1/tcp/${await getPort(8081)}`
    ]
    fs.writeJsonSync(configPath, config, { spaces: 2 })
    const { app } = await startApp({ repoPath })
    await daemonReady(app)
  })

  // Regression test for https://github.com/ipfs/ipfs-desktop/issues/3143
  test('shows upgrade dialog when repo version is newer than program', async () => {
    test.setTimeout(180000)
    // Init via kubo directly; makeRepository's ipfsd-ctl factory leaves a
    // daemon running against the repo that would mask the version override.
    const repoPath = tmp.dirSync({ prefix: 'tmp_IPFS_PATH_', unsafeCleanup: true }).name
    const { spawnSync } = require('child_process')
    const kuboPath = require('kubo').path()
    const initRes = spawnSync(kuboPath, ['init', '--profile=test'], {
      env: Object.assign({}, process.env, { IPFS_PATH: repoPath })
    })
    if (initRes.status !== 0) throw new Error(`kubo init failed: ${initRes.stderr?.toString()}`)

    // Writing a too-high repo version forces Kubo to emit:
    // "Error: Your programs version (N) is lower than your repos (999)."
    fs.writeFileSync(path.join(repoPath, 'version'), '999')

    const { app } = await startApp({ repoPath })

    const isPromptWindow = (page) => page.url().startsWith('data:text/html;base64,')

    // Subscribe before any other await; fall back to app.windows() in case
    // the event already fired between launch resolving and this subscription.
    const windowPromise = app.waitForEvent('window', { predicate: isPromptWindow, timeout: 120000 })
    const errorWindow = app.windows().find(isPromptWindow) ?? await windowPromise

    // The prompt may render the in-progress migration template first and
    // reload with the error/upgrade template once kubo exits, so wait for
    // the upgrade-specific string instead of asserting on first paint.
    await errorWindow.waitForFunction(
      () => document.body && document.body.innerText.includes('Download latest release'),
      null,
      { timeout: 45000 }
    )
    const html = await errorWindow.content()

    expect(html).toContain('Your IPFS repository was written by a newer version of IPFS Desktop or Kubo CLI')
    expect(html).toContain('https://github.com/ipfs/ipfs-desktop/releases/latest')
    expect(html).toContain('Download latest release')
    expect(html).not.toContain('Report the error')

    // Dismiss the dialog so afterEach does not race the prompt window during
    // app shutdown.
    await errorWindow.close()
  })
})
