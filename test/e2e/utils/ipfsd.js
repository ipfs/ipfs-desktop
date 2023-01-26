/* eslint-env mocha */

const tmp = require('tmp')
const Ctl = require('ipfsd-ctl')

const { join } = require('path')

const factory = Ctl.createFactory({
  type: 'go',
  ipfsHttpModule: require('ipfs-http-client'),
  ipfsBin: require('go-ipfs').path(),
  remote: false,
  disposable: true,
  test: true // run on random ports
})

async function makeRepository ({ start = false }) {
  const { name: repoPath } = tmp.dirSync({ prefix: 'tmp_IPFS_PATH_', unsafeCleanup: true })
  const configPath = join(repoPath, 'config')

  const ipfsd = await factory.spawn({
    ipfsOptions: { repo: repoPath },
    init: false,
    start: false
  })

  // manual init
  await ipfsd.init({
    profiles: ['test'],
    directory: repoPath
  })

  const { id } = await ipfsd.api.id()
  if (start) await ipfsd.start()
  return { ipfsd, repoPath, configPath, peerId: id }
}

module.exports = {
  makeRepository
}
