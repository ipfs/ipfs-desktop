/* eslint-env mocha */

const { applyDefaults } = require('../../../src/daemon/config')
const fs = require('fs-extra')

const tmp = require('tmp')
const { join } = require('path')

let _factory = null

async function getFactory () {
  if (_factory) return _factory

  const { createFactory } = await import('ipfsd-ctl')
  const { create } = await import('kubo-rpc-client')
  const kubo = require('kubo')

  _factory = createFactory({
    type: 'kubo',
    rpc: create,
    bin: kubo.path(),
    test: true,
    disposable: true
  })

  return _factory
}

async function makeRepository ({ start = false }) {
  const { name: repoPath } = tmp.dirSync({ prefix: 'tmp_IPFS_PATH_', unsafeCleanup: true })
  const configPath = join(repoPath, 'config')

  const factory = await getFactory()
  const ipfsd = await factory.spawn({
    repo: repoPath,
    init: {
      profiles: ['test']
    },
    start: false
  })

  applyDefaults(ipfsd)

  if (start) {
    await ipfsd.start()
  }

  // Get peerId from API if running, otherwise read from config file
  let peerId
  if (start) {
    peerId = (await ipfsd.api.id()).id.toString()
  } else {
    const config = fs.readJsonSync(configPath)
    peerId = config.Identity.PeerID
  }
  return { ipfsd, repoPath, configPath, peerId }
}

module.exports = {
  makeRepository
}
