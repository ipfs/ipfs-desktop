var path = require('path')
var os = require('os')
var fs = require('fs')
var app = require('app')

var IPFS_PATH_FILE = app.getDataPath() + '/ipfs-electron-app-node-path'

exports = module.exports = {
  'menu-bar': {
    width: 300,
    height: 400
  },
  window: {
    icon: path.resolve(__dirname, '../node_modules/ipfs-logo/ipfs-logo-256-ice.png'),
    'auto-hide-menu-bar': true,
    width: 800,
    height: 600
  },
  'tray-icon': (os.platform() !== 'darwin'
    ? path.resolve(__dirname, '../node_modules/ipfs-logo/ipfs-logo-256-ice.png')
    : path.resolve(__dirname, '../node_modules/ipfs-logo/platform-icons/osx-menu-bar.png')),
  'webui-path': '/webui',
  'ipfs-path': (function () {
    var pathIPFS
    try {
      pathIPFS = fs.readFileSync(IPFS_PATH_FILE, 'utf-8')
    } catch (e) {
      pathIPFS = process.env.IPFS_PATH ||
       (process.env.HOME || process.env.USERPROFILE) + '/.ipfs'
    }
    return pathIPFS
  })(),
  'ipfs-path-file': IPFS_PATH_FILE
}
