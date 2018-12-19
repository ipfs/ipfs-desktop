/* eslint-env mocha */

const Application = require('spectron').Application
const assert = require('assert')
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')

describe('Application launch', function () {
  this.timeout(10000)

  before(function () {
    this.app = new Application({
      path: electronPath,
      args: ['-r', '@babel/register', path.join(__dirname, '../src/index.js')]
    })
    return this.app.start()
  })

  after(function () {
    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  })

  it('starts menubar and webui window', function () {
    assert.ok(this.app.isRunning(), 'App is running')
    return this.app.client.getWindowCount().then(function (count) {
      assert.strictEqual(count, 2, 'menubar and webui window exist')
    })
  })
})
