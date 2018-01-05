import winston from 'winston'
import path from 'path'
import fs from 'fs'
import os from 'os'
import isDev from 'electron-is-dev'
import {app, dialog} from 'electron'

import FileHistory from './utils/file-history'
import KeyValueStore from './utils/key-value-store'
import PinnedFiles from './utils/pinned-files'

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

function ensurePath (path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
  }

  return path
}

const ipfsAppData = ensurePath(path.join(app.getPath('appData'), 'ipfs-desktop'))
const logsPath = ensurePath(path.join(ipfsAppData, 'logs'))

const pinnedFiles = new PinnedFiles(path.join(ipfsAppData, 'pinned-files.json'))
const fileHistory = new FileHistory(path.join(ipfsAppData, 'file-history.json'))
const settingsStore = new KeyValueStore(path.join(ipfsAppData, 'config.json'))

if (!settingsStore.get('ipfsPath')) {
  const p = path.join(process.env.IPFS_PATH || (process.env.HOME || process.env.USERPROFILE), '.ipfs')
  settingsStore.set('ipfsPath', p)
}

// Sets up the Logger
const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: path.join(logsPath, 'error.log'),
      level: 'error',
      handleExceptions: false
    }),
    new winston.transports.File({
      filename: path.join(logsPath, 'combined.log'),
      handleExceptions: false
    })
  ]
})

if (isDev) {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
    handleExceptions: false
  }))
}

function fatal (error) {
  logger.error(`Uncaught Exception: ${error.stack}`)

  dialog.showErrorBox(
    'Something wrong happened',
    `Some unexpected error occurred and we couldn't handle it. Please check ${path.join(logsPath, 'error.log')}` +
    ` for the latest logs and open an issue on https://github.com/ipfs-shipyard/ipfs-desktop/issues.`
  )

  process.exit(1)
}

// Set up what to do on Uncaught Exceptions and Unhandled Rejections
process.on('uncaughtException', fatal)
process.on('unhandledRejection', fatal)

export default {
  logger: logger,
  fileHistory: fileHistory,
  pinnedFiles: pinnedFiles,
  settingsStore: settingsStore,
  logo: {
    ice: logo('ice'),
    black: logo('black')
  },
  // Will be replaced by a Menubar instance.
  menubar: {
    index: `file://${__dirname}/views/menubar.html`,
    icon: logo('black'),
    tooltip: 'Your IPFS instance',
    preloadWindow: true,
    window: {
      resizable: false,
      skipTaskbar: true,
      width: 600,
      height: 400,
      backgroundColor: (settingsStore.get('lightTheme') ? '#FFFFFF' : '#000000'),
      webPreferences: {
        nodeIntegration: true,
        webSecurity: false
      }
    }
  }
}
