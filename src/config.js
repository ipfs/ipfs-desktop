import path from 'path'
import fs from 'fs'
import os from 'os'
import {app, dialog} from 'electron'
import dbgger from 'debug'
import {EventEmitter} from 'events'

import KeyValueStore from './utils/key-value-store'

const debug = dbgger('desktop')

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

const settingsStore = new KeyValueStore(path.join(ipfsAppData, 'config.json'))

if (!settingsStore.get('ipfsPath')) {
  const p = path.join(process.env.IPFS_PATH || (process.env.HOME || process.env.USERPROFILE), '.ipfs')
  settingsStore.set('ipfsPath', p)
}

function fatal (error) {
  debug(`Uncaught Exception: ${error.stack}`)

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
  events: new EventEmitter(),
  debug: debug,
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
      fullscreen: false,
      skipTaskbar: true,
      width: 900,
      height: 450,
      backgroundColor: '#eeeeee',
      webPreferences: {
        nodeIntegration: true,
        webSecurity: false
      }
    }
  }
}
