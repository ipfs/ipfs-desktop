/* eslint-env mocha */

const { _electron: electron } = require('playwright')
const path = require('path')
const fs = require('fs-extra')
const tmp = require('tmp')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const { makeRepository } = require('./utils/ipfsd')
const portfinder = require('portfinder')

const expect = chai.expect
chai.use(dirtyChai)

async function getPort () {
  return portfinder.getPortPromise()
}

describe('Application launch', function () {
  this.timeout(60000)
  let app = null

  afterEach(async function () {
    if (app) {
      await app.close()
    }
  })

  async function startApp ({ repoPath } = {}) {
    const home = tmp.dirSync({ prefix: 'tmp_home_', unsafeCleanup: true }).name
    if (!repoPath) {
      repoPath = path.join(home, '.ipfs')
    }

    app = await electron.launch({
      args: [path.join(__dirname, '../../src/index.js')],
      env: {
        NODE_ENV: 'test',
        HOME: home,
        IPFS_PATH: repoPath
      }
    })

    return { app, repoPath, home }
  }

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

  it('creates a repository on startup', async function () {
    const { app, repoPath } = await startApp({})
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
    const { peerId } = await daemonReady(app)
    expect(peerId).to.be.equal(expectedId)

    // ensure app has enabled cors checking
    config = fs.readJsonSync(configPath)
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
    await daemonReady(app)
  })
})
