/* eslint-env mocha */

const Application = require('spectron').Application
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')
const fs = require('fs-extra')

const { makeRepository } = require('./utils/ipfsd')

async function startApp (opts) {
  const app = new Application({
    path: electronPath,
    args: ['-r', '@babel/register', path.join(__dirname, '../src/index.js')],
    ...opts
  })

  await app.start()
  return app
}

describe('Application launch', function () {
  this.timeout(20000)

  /* it('starts with no initial repository', async () => {
    // TODO: how to simulate no initial repo on user Home?
  }) */

  it('starts with initial repository', async () => {
    const { dir, ipfsd } = await makeRepository()
    const app = await startApp({
      env: {
        IPFS_PATH: ipfsd.repoPath
      }
    })

    if (app && app.isRunning()) {
      await app.stop()
    }

    ipfsd.stop()
    dir.removeCallback()
  })

  it(`starts with repository with 'api' file`, async () => {
    const { dir, ipfsd } = await makeRepository()
    const configPath = path.join(ipfsd.repoPath, 'config')
    const apiPath = path.join(ipfsd.repoPath, 'api')
    const config = fs.readJsonSync(configPath)
    fs.writeFile(apiPath, config.Addresses.API)

    const app = await startApp({
      env: {
        IPFS_PATH: ipfsd.repoPath
      }
    })

    if (app && app.isRunning()) {
      await app.stop()
    }

    ipfsd.stop()
    dir.removeCallback()
  })
})
