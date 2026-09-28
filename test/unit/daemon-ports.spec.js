const http = require('http')
const { test, expect } = require('@playwright/test')
const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')

const apiPath = '/api/v0/refs?arg=/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'
const servers = []
let originalNodeEnv, originalCI

test.beforeEach(() => {
  originalNodeEnv = process.env.NODE_ENV
  originalCI = process.env.CI
  // Exercise the real prompt path instead of CI's automatic config rewrite.
  process.env.NODE_ENV = 'production'
  delete process.env.CI
})

test.afterEach(async () => {
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV
  else process.env.NODE_ENV = originalNodeEnv
  if (originalCI === undefined) delete process.env.CI
  else process.env.CI = originalCI
  for (const { server, sockets } of servers.splice(0)) {
    for (const socket of sockets) socket.destroy()
    await new Promise(resolve => server.close(resolve))
  }
})

async function listen (handler) {
  const requests = []
  const sockets = new Set()
  const server = http.createServer((req, res) => {
    requests.push({ method: req.method, url: req.url, accept: req.headers.accept })
    handler(req, res)
  })
  server.on('connection', socket => {
    sockets.add(socket)
    socket.on('close', () => sockets.delete(socket))
  })
  servers.push({ server, sockets })
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  return { addr: `/ip4/127.0.0.1/tcp/${server.address().port}`, requests, sockets }
}

function apiHandler (req, res) {
  res.writeHead(req.method === 'POST' && req.url === apiPath ? 200 : 404)
  res.end()
}

function gatewayHandler (req, res) {
  const valid = req.method === 'HEAD' && req.url === '/ipfs/bafkqaaa' &&
    req.headers.accept === 'application/vnd.ipld.raw'
  res.writeHead(valid ? 200 : 404)
  res.end()
}

function load (API, Gateway) {
  const writeJsonSync = sinon.stub()
  const getPortPromise = sinon.stub().callsFake(async ({ port }) => port + 1)
  const dialogs = {
    busyPortsDialog: sinon.stub().returns(false),
    busyPortDialog: sinon.stub().returns(false),
    multipleBusyPortsDialog: sinon.stub().returns(false)
  }
  const { checkPorts } = proxyquire('../../src/daemon/config', {
    'fs-extra': { readJsonSync: () => ({ Addresses: { API, Gateway } }), writeJsonSync },
    portfinder: { getPortPromise },
    electron: { shell: {} },
    '../common/store': {},
    '../common/logger': { info: () => {} },
    '../cid-profile': {},
    './dialogs': dialogs
  })
  return {
    check: () => checkPorts({ path: '/unused-probe-test-repository' }),
    writeJsonSync,
    getPortPromise,
    dialogs
  }
}

for (const apiArray of [false, true]) {
  for (const gatewayArray of [false, true]) {
    test(`recognizes existing API and gateway (API array: ${apiArray}, gateway array: ${gatewayArray})`, async () => {
      const api = await listen(apiHandler)
      const gateway = await listen(gatewayHandler)
      const probe = load(apiArray ? [api.addr, api.addr] : api.addr, gatewayArray ? [gateway.addr, gateway.addr] : gateway.addr)

      expect(await probe.check()).toBe(true)
      expect(api.requests).toHaveLength(apiArray ? 2 : 1)
      expect(gateway.requests).toHaveLength(gatewayArray ? 2 : 1)
      expect(api.requests.every(req => req.method === 'POST' && req.url === apiPath)).toBe(true)
      expect(gateway.requests.every(req => req.method === 'HEAD' && req.url === '/ipfs/bafkqaaa')).toBe(true)
      expect(probe.getPortPromise.called).toBe(false)
      expect(probe.writeJsonSync.called).toBe(false)
      for (const dialog of Object.values(probe.dialogs)) expect(dialog.called).toBe(false)
    })
  }
}

for (const status of [301, 404, 500]) {
  test(`does not accept gateway HTTP ${status} as a healthy gateway`, async () => {
    const api = await listen(apiHandler)
    const gateway = await listen((req, res) => { res.writeHead(status); res.end() })
    const probe = load(api.addr, gateway.addr)
    expect(await probe.check()).toBe(false)
    expect(probe.dialogs.busyPortsDialog.calledOnce).toBe(true)
    expect(probe.writeJsonSync.called).toBe(false)
  })
}

test('does not accept an RPC-only service on a gateway array address', async () => {
  const api = await listen(apiHandler)
  const wrongGateway = await listen(apiHandler)
  const probe = load([api.addr], [wrongGateway.addr])
  expect(await probe.check()).toBe(false)
  expect(probe.dialogs.multipleBusyPortsDialog.calledOnce).toBe(true)
  expect(probe.writeJsonSync.called).toBe(false)
})

test('does not accept a healthy gateway when the API probe fails', async () => {
  const api = await listen((req, res) => { res.writeHead(404); res.end() })
  const gateway = await listen(gatewayHandler)
  const probe = load(api.addr, gateway.addr)
  expect(await probe.check()).toBe(false)
  expect(probe.dialogs.busyPortsDialog.calledOnce).toBe(true)
  expect(probe.writeJsonSync.called).toBe(false)
})

test('preserves automatic port selection and empty entries in address arrays', async () => {
  const probe = load([null, '', '/ip4/127.0.0.1/tcp/0'], [])
  expect(await probe.check()).toBe(true)
  expect(probe.getPortPromise.called).toBe(false)
  expect(probe.writeJsonSync.called).toBe(false)
})

test('handles connection errors without accepting the gateway', async () => {
  const api = await listen(apiHandler)
  const gateway = await listen(req => req.socket.destroy())
  const probe = load(api.addr, gateway.addr)
  expect(await probe.check()).toBe(false)
  expect(probe.writeJsonSync.called).toBe(false)
})

test('closes stalled probes after the deadline', async () => {
  test.setTimeout(10000)
  const api = await listen(apiHandler)
  const gateway = await listen(() => {})
  const probe = load(api.addr, gateway.addr)
  expect(await probe.check()).toBe(false)
  await expect.poll(() => gateway.sockets.size).toBe(0)
  expect(probe.writeJsonSync.called).toBe(false)
})

test('closes an unfinished API response after reading its status', async () => {
  const api = await listen((req, res) => {
    res.writeHead(200)
    res.flushHeaders()
    res.write('unfinished response')
  })
  const gateway = await listen(gatewayHandler)
  const probe = load(api.addr, gateway.addr)
  expect(await probe.check()).toBe(true)
  await expect.poll(() => api.sockets.size).toBe(0)
  expect(probe.writeJsonSync.called).toBe(false)
})
