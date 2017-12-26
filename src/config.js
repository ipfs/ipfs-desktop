import winston from 'winston'
import path from 'path'
import fs from 'fs'
import os from 'os'
import isDev from 'electron-is-dev'
import {app, dialog} from 'electron'

import FileHistory from './utils/file-history'
import KeyValueStore from './utils/key-value-store'

// Set up what to do on Uncaught Exceptions
process.on('uncaughtException', (error) => {
  const msg = error.message || error
  logger.error(`Uncaught Exception: ${msg}`, error)
  // TODO: save error to somewhere (in .txt) and recommend the user
  // to open an issue on the repo
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
  fileHistory: fileHistory,
  settingsStore: settingsStore,
  logo: {
    ice: logo('ice'),
    black: logo('black')
  },
  // Will be replaced by a BrowserWindow instance.
  settingsWindow: {
    index: `file://${__dirname}/views/settings.html`,
    title: 'IPFS Station Settings',
    show: false,
    icon: logo('ice'),
    backgroundColor: '#252525',
    resizable: false,
    width: 450,
    height: 450
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
      width: 850,
      height: 400,
      backgroundColor: '#000000',
      webPreferences: {
        nodeIntegration: true,
        webSecurity: false
      }
    }
  }
}
