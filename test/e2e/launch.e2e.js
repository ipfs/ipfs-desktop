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
const getPort = require('get-port')

const expect = chai.expect
chai.use(dirtyChai)

// To print the app logs, add the following to your test:
//
// const logs = await app.client.getMainProcessLogs()
// logs.forEach(line => console.log(line))
//
function createTmpDir () {
  return tmp.dirSync({ unsafeCleanup: true }).name
}

const timeout = process.env.CI ? 180000 : 60000

describe('Application launch', function () {
  this.timeout(timeout)
  let app = null

  afterEach(async function () {
    if (app && app.isRunning()) {
      // await app.stop() did not work reliably on Mac
      // we have a manual failsafe that runs on slow CI
      const pid = await app.mainProcess.pid()
      const kill = async (pid) => {
        await delay(15000)
        try {
          // send signal 0 to test of pid still exists
          process.kill(pid, 0)
        } catch (e) {
          // no process with the pid, already killed, exiting
          return
        }
        // double tap
        return app.mainProcess.exit(0)
      }
      return Promise.race([
        app.stop(),
        kill(pid)
      ])
    }
  })

  async function startApp ({
    home = createTmpDir(),
    ipfsPath = path.join(home, '.ipfs')
  }) {
    app = new Application({
      path: electronPath,
      args: ['-r', path.join(__dirname, 'utils/include.js'), path.join(__dirname, '../../src/index.js')],
      env: {
        NODE_ENV: 'test',
        HOME: home,
        IPFS_PATH: ipfsPath
      }
    })
    await app.start()
    return { app, ipfsPath, home }
  }

  it('creates a repository on startup', async function () {
    const { app, home } = await startApp({})
    const configPath = path.join(home, '.ipfs', 'config')
    expect(app.isRunning()).to.be.true()

    // TODO: need a signal from the app to know when ipfs is ready.
    // SEE: can't listent for IPC events in spectron https://github.com/electron/spectron/issues/91
    await delay(5000)
    const config = fs.readJsonSync(configPath)
    expect(config).to.exist()
    // ensure strict CORS checking is enabled
    expect(config.API.HTTPHeaders).to.deep.equal({})
    expect(config.Discovery.MDNS.Enabled).to.be.true()
  })

  it('starts when external ipfsd is running', async function () {
    const { ipfsd } = await makeRepository()
    const { app } = await startApp({ ipfsPath: ipfsd.repoPath })
    expect(app.isRunning()).to.be.true()
    await ipfsd.stop()
  })

  it('fixes config for cors checking', async function () {
    // create config
    const { ipfsd } = await makeRepository()
    const { repoPath } = ipfsd
    await ipfsd.stop()

    // check config has cors disabled
    const configPath = path.join(repoPath, 'config')
    let config = fs.readJsonSync(configPath)
    expect(config.API.HTTPHeaders['Access-Control-Allow-Origin']).to.include('*')

    const { app } = await startApp({ ipfsPath: repoPath })
    expect(app.isRunning()).to.be.true()
    await delay(5000)
    config = fs.readJsonSync(configPath)
    // ensure app has enabled cors checking
    expect(config.API.HTTPHeaders['Access-Control-Allow-Origin']).to.deep.equal([])

    // TODO: figure out why the app alters the config on subsequent runs in test mode.
    // NOTE: it does what we expect when running for reals.
    // await app.stop()
    // // check it doesn't alter the config on second run.
    // config.API.HTTPHeaders['Access-Control-Allow-Origin'] = ['*']
    // fs.writeJsonSync(configPath, config, { spaces: 2 })
    // await app.start()
    // delay(5000)
    // config = fs.readJsonSync(configPath)
    // expect(config.API.HTTPHeaders['Access-Control-Allow-Origin']).to.include('*')
  })

  it('fixes config for cors checking where multiple allowed origins', async function () {
    // create config
    const { ipfsd } = await makeRepository()
    const { repoPath } = ipfsd
    await ipfsd.stop()

    // check config has cors disabled
    const configPath = path.join(repoPath, 'config')
    const initConfig = fs.readJsonSync(configPath)
    // update origins to include multiple entries, including wildcard.
    const newOrigins = ['https://webui.ipfs.io', '*']
    initConfig.API.HTTPHeaders['Access-Control-Allow-Origin'] = newOrigins
    fs.writeJsonSync(configPath, initConfig, { spaces: 2 })

    const { app } = await startApp({ ipfsPath: repoPath })
    expect(app.isRunning()).to.be.true()
    await delay(5000)
    const config = fs.readJsonSync(configPath)
    // ensure app has enabled cors checking
    const specificOrigins = newOrigins.filter(origin => origin !== '*')
    expect(config.API.HTTPHeaders['Access-Control-Allow-Origin']).to.deep.equal(specificOrigins)
  })

  it('starts with repository with \'api\' file and no daemon running', async function () {
    const { ipfsd } = await makeRepository()
    const { repoPath } = ipfsd
    await ipfsd.stop()
    const configPath = path.join(repoPath, 'config')
    const apiPath = path.join(repoPath, 'api')
    const config = fs.readJsonSync(configPath)
    await fs.writeFile(apiPath, config.Addresses.API)
    const { app } = await startApp({ ipfsPath: ipfsd.repoPath })
    expect(app.isRunning()).to.be.true()
  })

  it('starts with multiple api addresses', async function () {
    const { ipfsd } = await makeRepository()
    const { repoPath } = ipfsd
    await ipfsd.stop()
    const configPath = path.join(repoPath, 'config')
    const config = fs.readJsonSync(configPath)

    config.Addresses.API = [`/ip4/127.0.0.1/tcp/${await getPort()}`, `/ip4/127.0.0.1/tcp/${await getPort()}`]

    await fs.writeFile(configPath, config)
    const { app } = await startApp({ ipfsPath: ipfsd.repoPath })
    expect(app.isRunning()).to.be.true()
  })

  it('starts with multiple gateway addresses', async function () {
    const { ipfsd } = await makeRepository()
    const { repoPath } = ipfsd
    await ipfsd.stop()
    const configPath = path.join(repoPath, 'config')
    const config = fs.readJsonSync(configPath)

    config.Addresses.Gateway = [`/ip4/127.0.0.1/tcp/${await getPort()}`, `/ip4/127.0.0.1/tcp/${await getPort()}`]

    await fs.writeFile(configPath, config)
    const { app } = await startApp({ ipfsPath: ipfsd.repoPath })
    expect(app.isRunning()).to.be.true()
  })
})
