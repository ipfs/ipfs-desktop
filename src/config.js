import winston from 'winston'
import path from 'path'
import fs from 'fs'
import os from 'os'
import isDev from 'electron-is-dev'
import {app, dialog} from 'electron'
import FileHistory from './utils/file-history'

// Set up what to do on Uncaught Exceptions
process.on('uncaughtException', (error) => {
  const msg = error.message || error
  logger.error(`Uncaught Exception: ${msg}`, error)
  dialog.showErrorBox('Uncaught Exception:', msg)
  process.exit(1)
})

// Set up crash reporter or electron debug
if (isDev) {
  require('electron-debug')()
}

function logo (color) {
  const p = path.resolve(path.join(__dirname, 'img'))

  if (os.platform() === 'darwin') {
    return path.join(p, `icons/${color}.png`)
  }

  return path.join(p, `ipfs-logo-${color}.png`)
}

const ipfsAppData = (() => {
  const p = path.join(app.getPath('appData'), 'ipfs-station')

  if (!fs.existsSync(p)) {
    fs.mkdirSync(p)
  }

  return p
})()

const ipfsPathFile = path.join(ipfsAppData, 'app-node-path')
const ipfsFileHistoryFile = path.join(ipfsAppData, 'file-history.json')

const ipfsPath = (() => {
  let pathIPFS

  if (fs.existsSync(ipfsPathFile)) {
    pathIPFS = fs.readFileSync(ipfsPathFile, 'utf-8')
  } else {
    pathIPFS = path.join(process.env.IPFS_PATH ||
      (process.env.HOME || process.env.USERPROFILE), '.ipfs')
  }

  return pathIPFS
})()

// Sets up the Logger
const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: 'error.log',
      level: 'error',
      handleExceptions: false
    }),
    new winston.transports.File({
      filename: 'combined.log',
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

export default {
  logger: logger,
  fileHistory: new FileHistory(ipfsFileHistoryFile),
  logo: {
    ice: logo('ice'),
    black: logo('black')
  },
  menubar: {
    dir: __dirname,
    width: 850,
    height: 400,
    backgroundColor: '#000000',
    index: `file://${__dirname}/views/menubar.html`,
    icon: logo('black'),
    tooltip: 'Your IPFS instance',
    preloadWindow: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false
    }
  },
  ipfsPath: ipfsPath,
  ipfsPathFile: ipfsPathFile
}
