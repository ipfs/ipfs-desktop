const sinon = require('sinon')

module.exports = function mockNotify () {
  return {
    notify: sinon.spy(),
    notifyError: sinon.spy()
  }
}
