/* eslint-env mocha */

const tmp = require('tmp')
const IPFSFactory = require('ipfsd-ctl')

async function makeRepository () {
  const dir = tmp.dirSync({ unsafeCleanup: true })
  const factory = IPFSFactory.create({ type: 'go' })

  const ipfsd = await factory.spawn({
    disposable: false,
    repoPath: dir.name,
    init: false,
    start: false
  })

  await ipfsd.init({
    bits: 1024,
    profile: 'test',
    directory: dir.name
  })

  return { ipfsd, dir }
}

module.exports = {
  makeRepository
}
