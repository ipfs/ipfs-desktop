/* eslint-env mocha */

const Application = require('spectron').Application
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')
const fs = require('fs-extra')
const tmp = require('tmp')

const { makeRepository } = require('./utils/ipfsd')

async function startApp (opts) {
  opts = opts || {}
  opts.env = opts.env || {}

  this.home = tmp.dirSync({ unsafeCleanup: true })
  this.app = new Application({
    path: electronPath,
    args: ['-r', path.join(__dirname, 'utils/include.js'), path.join(__dirname, '../src/index.js')],
    ...opts,
    env: {
      HOME: this.home.name
    }
  })

  await this.app.start()
}

describe('Application launch', function () {
  this.timeout(60000)

  it('starts with no initial repository', async function () {
    await startApp.bind(this)()
  })

  it('starts with initial repository', async function () {
    const { dir, ipfsd } = await makeRepository()

    await startApp.bind(this)({
      env: {
        IPFS_PATH: ipfsd.repoPath
      }
    })

    this.dir = dir
    this.ipfsd = ipfsd
  })

  it(`starts with repository with 'api' file`, async function () {
    const { dir, ipfsd } = await makeRepository()
    const configPath = path.join(ipfsd.repoPath, 'config')
    const apiPath = path.join(ipfsd.repoPath, 'api')
    const config = fs.readJsonSync(configPath)
    fs.writeFile(apiPath, config.Addresses.API)

    await startApp.bind(this)({
      env: {
        IPFS_PATH: ipfsd.repoPath
      }
    })

    this.dir = dir
    this.ipfsd = ipfsd
  })

  afterEach(async function () {
    if (this.app && this.app.isRunning()) {
      await this.app.stop()
    }

    if (this.ipfsd) {
      await this.ipfsd.stop()
    }
  })
})
