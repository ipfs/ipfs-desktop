/* eslint-env mocha */

const chai = require('chai')
const path = require('path')
const { expect } = chai
const dirtyChai = require('dirty-chai')

const mockElectron = require('./mocks/electron')
const mockLogger = require('./mocks/logger')
const mockNotify = require('./mocks/notify')

const proxyquire = require('proxyquire').noCallThru()

const { makeRepository } = require('./../e2e/utils/ipfsd')

chai.use(dirtyChai)

const getFixtures = (...files) => files.map(f => path.join(__dirname, 'fixtures', f))

describe('Add To Ipfs', function () {
  this.timeout(60000)

  let electron, notify, addToIpfs, ipfsd, ctx

  before(async () => {
    const repo = await makeRepository({ start: true })
    ipfsd = repo.ipfsd
    ctx = {
      getIpfsd: () => ipfsd,
      launchWebUI: () => {}
    }
  })

  after(async () => {
    if (ipfsd) await ipfsd.stop()
  })

  beforeEach(async () => {
    electron = mockElectron()
    notify = mockNotify()
    addToIpfs = proxyquire('../../src/add-to-ipfs', {
      electron: electron,
      './common/notify': notify,
      './common/logger': mockLogger()
    })
  })

  it('add to ipfs single file', async () => {
    const cid = await addToIpfs(ctx, getFixtures('hello-world.txt'))
    expect(electron.clipboard.writeText.callCount).to.equal(1)
    expect(notify.notifyError.callCount).to.equal(0)
    expect(notify.notify.callCount).to.equal(1)
    expect(cid.toString()).to.equal('QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks')
  })

  it('add to ipfs single directory', async () => {
    const cid = await addToIpfs(ctx, getFixtures('dir'))
    expect(electron.clipboard.writeText.callCount).to.equal(1)
    expect(notify.notifyError.callCount).to.equal(0)
    expect(notify.notify.callCount).to.equal(1)
    expect(cid.toString()).to.equal('QmVuxXkWEyCKvQiMqVnDiwyJUUyDQZ7VsKhQDCZzPj1Yq8')
  })

  it('add to ipfs multiple files', async () => {
    const cid = await addToIpfs(ctx, getFixtures('dir', 'hello-world.txt'))
    expect(electron.clipboard.writeText.callCount).to.equal(1)
    expect(notify.notifyError.callCount).to.equal(0)
    expect(notify.notify.callCount).to.equal(1)
    expect(cid.toString()).to.equal('QmdYASNGKMVK4HL1uzi3VCZyjQGg3M6VuLsgX5xTKL1gvH')
  })
})
