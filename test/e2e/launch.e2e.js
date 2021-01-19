/* eslint-env mocha */

const { Application } = require('spectron')
const electronPath = require('electron') // Require Electron = require(the binaries included in node_modules.)
const path = require('path')
const fs = require('fs-extra')
const tmp = require('tmp')
const delay = require('delay')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const { makeRepository } = require('./utils/ipfsd')
const portfinder = require('portfinder')

const expect = chai.expect
chai.use(dirtyChai)

// To print the app logs, add the following to your test:
//
// const logs = await app.client.getMainProcessLogs()
// logs.forEach(line => console.log(line))
//
async function getPort () {
  return portfinder.getPortPromise()
}

// Note: logs before "start daemon FINISHED" event are consumed
// inside of `daemonReady`. To print them, pass DEBUG=true

describe('Application launch', function () {
  this.timeout(60000)
  let app = null

  afterEach(async function () {
    if (app && app.isRunning()) {
      await app.stop()
    }
  })

  async function startApp ({
    home = tmp.dirSync({ prefix: 'tmp_HOME_', unsafeCleanup: true }).name,
    repoPath = path.join(home, '.ipfs')
  }) {
    app = new Application({
      path: electronPath,
      args: ['-r', path.join(__dirname, 'utils/include.js'), path.join(__dirname, '../../src/index.js')],
      env: {
        NODE_ENV: 'test',
        HOME: home,
        IPFS_PATH: repoPath
      }
    })
    await app.start()
    return { app, repoPath, home }
  }

  async function daemonReady (app, timeout = 45000) {
    // TODO: replace this hack with a signal from the app to know when ipfs is ready.
    // Right now we can't listen for IPC events in spectron (https://github.com/electron/spectron/issues/91)
    // As a workaround, we look at console output and match on strings :<
    const tick = 250
    const ready = (output) => output && output.match(/(?:daemon is running|Daemon is ready|start daemon FINISHED)/)
    const hasPeerId = (output) => output && output.trim().match(/PeerID is (\w+)$/)
    let peerId
    while (true) {
      const logs = await app.client.getMainProcessLogs()
      for (const line of logs) {
        if (process.env.DEBUG) console.log(line)
        const idMatch = hasPeerId(line)
        if (idMatch) peerId = idMatch[1]
        if (ready(line)) {
          return { peerId }
        }
      }
      await delay(tick)
      timeout = timeout - tick
      if (timeout < 0) throw new Error('timeout while waiting for daemon start in daemonReady(app)')
    }
  }

  it('creates a repository on startup', async function () {
    const { app, repoPath } = await startApp({})
    expect(app.isRunning()).to.be.true()
    const { peerId } = await daemonReady(app)
    // expect config to be created and match peerId
    const configPath = path.join(repoPath, 'config')
    const config = fs.readJsonSync(configPath)
    expect(config).to.exist()
    // confirm PeerID is matching one from repoPath/config
    expect(config.Identity.PeerID).to.be.equal(peerId)
    // ensure strict CORS checking is enabled
    expect(config.API.HTTPHeaders).to.deep.equal({})
    expect(config.Discovery.MDNS.Enabled).to.be.true()
  })

  it('starts fine when node is already running', async function () {
    const { ipfsd } = await makeRepository({ start: true })
    const { app } = await startApp({ repoPath: ipfsd.path })
    expect(app.isRunning()).to.be.true()
    const { peerId } = await daemonReady(app)
    const { id: expectedId } = await ipfsd.api.id()
    expect(peerId).to.be.equal(expectedId)
    await ipfsd.stop()
  })

  it('applies config migration to existing config', async function () {
    // create preexisting, initialized repo and config
    const { repoPath, configPath, peerId: expectedId } = await makeRepository({ start: false })

    // setup "broken" config for the test
    const initConfig = fs.readJsonSync(configPath)
    // simulate bug from https://github.com/ipfs-shipyard/ipfs-desktop/issues/1631
    delete initConfig.Discovery.MDNS.Enabled
    initConfig.Discovery.MDNS.enabled = true
    fs.writeJsonSync(configPath, initConfig, { spaces: 2 })

    const { app } = await startApp({ repoPath })
    expect(app.isRunning()).to.be.true()

    const { peerId } = await daemonReady(app)
    expect(peerId).to.be.equal(expectedId)

    const config = fs.readJsonSync(configPath)
    // ensure app has migrated config
    expect(config.Discovery.MDNS.enabled).to.be.undefined()
    expect(config.Discovery.MDNS.Enabled).to.be.true()
  })

  it('fixes cors config if access to "*" is granted', async function () {
    // create config
    const { repoPath, configPath, peerId: expectedId } = await makeRepository({ start: false })
    let config = fs.readJsonSync(configPath)

    // pretend someone set dangerous "*" (allowing global access to API)
    // Note: '*' is the default when running ipfsd-ctl with test=true, but we set it here just to be sure
    config.API.HTTPHeaders['Access-Control-Allow-Origin'] = ['*']
    fs.writeJsonSync(configPath, config, { spaces: 2 })

    const { app } = await startApp({ repoPath })
    expect(app.isRunning()).to.be.true()
    const { peerId } = await daemonReady(app)
    expect(peerId).to.be.equal(expectedId)

    // ensure app has enabled cors checking
    config = fs.readJsonSync(configPath)
    await app.stop()

    expect(config.API.HTTPHeaders['Access-Control-Allow-Origin']).to.be.deep.equal([])
  })

  it('fixes cors config with multiple allowed origins', async function () {
    // create preexisting, initialized repo and config
    const { repoPath, configPath, peerId: expectedId } = await makeRepository({ start: false })

    // setup CORS config for the test
    const initConfig = fs.readJsonSync(configPath)
    // update origins to include multiple entries, including wildcard.
    const newOrigins = ['https://webui.ipfs.io', '*']
    initConfig.API.HTTPHeaders['Access-Control-Allow-Origin'] = newOrigins
    fs.writeJsonSync(configPath, initConfig, { spaces: 2 })

    const { app } = await startApp({ repoPath })
    expect(app.isRunning()).to.be.true()

    const { peerId } = await daemonReady(app)
    expect(peerId).to.be.equal(expectedId)

    const config = fs.readJsonSync(configPath)
    // ensure app has enabled cors checking
    const specificOrigins = newOrigins.filter(origin => origin !== '*')
    expect(config.API.HTTPHeaders['Access-Control-Allow-Origin']).to.deep.equal(specificOrigins)
  })

  it('starts with repository with "IPFS_PATH/api" file and no daemon running', async function () {
    // create "remote" repo
    const { ipfsd } = await makeRepository({ start: true })

    // create "local" repo
    const { repoPath, configPath } = await makeRepository({ start: false })
    fs.unlinkSync(configPath) // remove config file to ensure local repo can't be used

    // create IPFS_PATH/api file to point at remote node
    const apiPath = path.join(repoPath, 'api')
    fs.writeFile(apiPath, ipfsd.apiAddr.toString())

    const { app } = await startApp({ repoPath })
    expect(app.isRunning()).to.be.true()
    await daemonReady(app)
    await ipfsd.stop()
  })

  it('starts with multiple api addresses', async function () {
    const { repoPath, configPath } = await makeRepository({ start: false })
    const config = fs.readJsonSync(configPath)
    config.Addresses.API = [
      `/ip4/127.0.0.1/tcp/${await getPort(5001)}`,
      `/ip4/127.0.0.1/tcp/${await getPort(5002)}`
    ]
    fs.writeJsonSync(configPath, config, { spaces: 2 })
    const { app } = await startApp({ repoPath })
    expect(app.isRunning()).to.be.true()
    await daemonReady(app)
  })

  it('starts with multiple gateway addresses', async function () {
    const { repoPath, configPath } = await makeRepository({ start: false })
    const config = fs.readJsonSync(configPath)
    config.Addresses.Gateway = [
      `/ip4/127.0.0.1/tcp/${await getPort(8080)}`,
      `/ip4/127.0.0.1/tcp/${await getPort(8081)}`
    ]
    fs.writeJsonSync(configPath, config, { spaces: 2 })
    const { app } = await startApp({ repoPath })
    expect(app.isRunning()).to.be.true()
    await daemonReady(app)
  })
})
