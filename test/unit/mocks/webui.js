const sinon = require('sinon')

module.exports = function mockWebUI () {
  return {
    webContents: {
      send: sinon.spy()
    }
  }
}
