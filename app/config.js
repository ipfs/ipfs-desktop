var path = require('path')
var os = require('os')

exports = module.exports = {
  'menu-bar-width': 240,
  window: {
    icon: path.resolve(__dirname, '../node_modules/ipfs-logo/ipfs-logo-256-ice.png'),
    'auto-hide-menu-bar': true,
    width: 800,
    height: 600
  },
  'tray-icon': (os.platform() !== 'darwin' ?
    path.resolve(__dirname, '../node_modules/ipfs-logo/ipfs-logo-256-ice.png')
    : path.resolve(__dirname, '../node_modules/ipfs-logo/platform-icons/osx-menu-bar.png')),
  'webui-path': '/webui'
}
