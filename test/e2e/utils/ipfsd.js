/* eslint-env mocha */

const tmp = require('tmp')

const { join } = require('path')

let factory
async function getFactory () {
  if (factory === undefined) {
    const ipfsHttpModule = await import('ipfs-http-client')
    const { createFactory } = await import('ipfsd-ctl')
    factory = createFactory({
      type: 'go',
      ipfsHttpModule,
      ipfsBin: require('go-ipfs').path(),
      remote: false,
      disposable: true,
      test: true // run on random ports
    })
  }
  return factory
}

async function makeRepository ({ start = false }) {
  const { name: repoPath } = tmp.dirSync({ prefix: 'tmp_IPFS_PATH_', unsafeCleanup: true })
  const configPath = join(repoPath, 'config')

  const factory = await getFactory()
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
