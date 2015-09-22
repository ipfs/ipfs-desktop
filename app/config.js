import path from 'path'
import os from 'os'
import fs from 'fs'

const app = require('app')

const isProduction = process.env.NODE_ENV === 'production'
const IPFS_PATH_FILE = app.getDataPath() + '/ipfs-electron-app-node-path'

const trayIcon = () => {
  if (os.platform() !== 'darwin') {
    return path.resolve(__dirname, '../node_modules/ipfs-logo/ipfs-logo-256-ice.png')
  }

  return path.resolve(__dirname, '../node_modules/ipfs-logo/platform-icons/osx-menu-bar.png')
}

const menuBar = {
  dir: __dirname,
  width: 300,
  height: 400,
  index: isProduction
    ? `file://${__dirname}/menubar.html`
    : 'http://localhost:3000/menubar.html',
  icon: trayIcon(),
  'always-on-top': !isProduction,
  preloadWindow: true,
  resizable: false,
  'web-preferences': {
    'web-security': false
  }
}

const window = {
  icon: path.resolve(__dirname, '../node_modules/ipfs-logo/ipfs-logo-256-ice.png'),
  'auto-hide-menu-bar': true,
  width: 800,
  height: 600
}

const ipfsPath = () => {
  let pathIPFS
  try {
    pathIPFS = fs.readFileSync(IPFS_PATH_FILE, 'utf-8')
  } catch (e) {
    pathIPFS = process.env.IPFS_PATH ||
      (process.env.HOME || process.env.USERPROFILE) + '/.ipfs'
  }

  return pathIPFS
}

export default {
  menuBar,
  window,
  'tray-icon': trayIcon(),
  'webui-path': '/webui',
  'ipfs-path': ipfsPath(),
  'ipfs-path-file': IPFS_PATH_FILE
}
