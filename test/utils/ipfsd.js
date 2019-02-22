/* eslint-env mocha */

const tmp = require('tmp')
const IPFSFactory = require('ipfsd-ctl')

async function makeRepository () {
  const dir = tmp.dirSync({ unsafeCleanup: true })
  const factory = IPFSFactory.create({ type: 'go' })

  const ipfsd = await new Promise((resolve, reject) => {
    factory.spawn({
      disposable: false,
      repoPath: dir.name,
      init: false,
      start: false
    }, function (err, ipfsd) {
      if (err) return reject(err)
      ipfsd.init({
        bits: 1024,
        profile: 'test',
        directory: dir.name
      }, e => {
        if (e) return reject(e)
        resolve(ipfsd)
      })
    })
  })

  return { ipfsd, dir }
}

module.exports = {
  makeRepository
}
