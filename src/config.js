import winston from 'winston'
import path from 'path'
import fs from 'fs'
import os from 'os'
import isDev from 'electron-is-dev'
import {app} from 'electron'
import {getLogo, macOsMenuBar} from './utils/logo'

const isProduction = !isDev
const currentURL = (name) => `file://${__dirname}/views/${name}.html`
const ipfsAppData = (() => {
  let p = path.join(app.getPath('appData'), 'ipfs-station')

  if (!fs.existsSync(p)) {
    fs.mkdirSync(p)
  }

  return p
})()

const ipfsPathFile = path.join(ipfsAppData, 'app-node-path')
const ipfsFileHistoryFile = path.join(ipfsAppData, 'file-history.json')

const ipfsPath = (() => {
  let pathIPFS
  try {
    pathIPFS = fs.readFileSync(ipfsPathFile, 'utf-8')
  } catch (e) {
    pathIPFS = path.join(process.env.IPFS_PATH ||
      (process.env.HOME || process.env.USERPROFILE), '.ipfs')
  }

  return pathIPFS
})()

// Sets up the Logger
export const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, 'app.log'),
      handleExceptions: false
    })
  ]
})

if (isDev) {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
    handleExceptions: false
  }))
}

// Default settings for new windows
const window = {
  icon: getLogo(),
  title: 'IPFS Dashboard',
  autoHideMenuBar: true,
  width: 800,
  height: 500,
  webPreferences: {
    webSecurity: false
  }
}

// Configuration for the MenuBar
const menubar = {
  dir: __dirname,
  width: 800,
  height: 400,
  index: `file://${__dirname}/views/menubar.html`,
  icon: (os.platform() === 'darwin') ? macOsMenuBar : getLogo(),
  tooltip: 'Your IPFS instance',
  alwaysOnTop: true,
  preloadWindow: true,
  resizable: false,
  skipTaskbar: true,
  webPreferences: {
    nodeIntegration: true,
    webSecurity: false
  }
}

export default {
  isProduction,
  logger,
  menubar,
  window,
  webuiPath: '/webui',
  ipfsPath,
  ipfsPathFile,
  ipfsFileHistoryFile,
  urls: {
    welcome: currentURL('welcome'),
    settings: currentURL('settings')
  }
}
