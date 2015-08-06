var config = require('./../config.js')
var multiaddr = require('multiaddr')

exports = module.exports

exports.apiAddrToUrl = function apiAddrToUrl (apiAddr) {
  var parts = multiaddr(apiAddr).nodeAddress()
  var url = 'http://' + parts.address + ':' + parts.port + config['webui-path']
  return url
}
