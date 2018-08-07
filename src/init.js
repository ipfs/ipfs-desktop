import IPFSFactory from 'ipfsd-ctl'
import config from './config'
import { join } from 'path'
import { BrowserWindow, dialog, ipcMain, app } from 'electron'

async function getIpfs ({ type, path, flags, keysize, init }) {
  let factOpts = { type: type }

  if (type === 'proc') {
    factOpts.exec = require('ipfs')
  }

  const factory = IPFSFactory.create(factOpts)

  return new Promise((resolve, reject) => {
    const start = (ipfsd) => ipfsd.start(flags, (err, api) => {
      if (err) return reject(err)
      else resolve(ipfsd)
    })

    factory.spawn({
      init: false,
      start: false,
      disposable: false,
      defaultAddrs: true,
      repoPath: path
    }, (err, ipfsd) => {
      if (err) return reject(err)

      if (ipfsd.started) {
        return resolve(ipfsd)
      }

      if (!ipfsd.initialized && init) {
        return ipfsd.init({
          directory: path,
          keysize: keysize
        }, err => {
          if (err) return reject(err)
          else start(ipfsd)
        })
      }

      start(ipfsd)
    })
  })
}

function welcome ({ path }) {
  return new Promise((resolve, reject) => {
    let ipfs = null

    // Initialize the welcome window.
    const window = new BrowserWindow({
      title: 'Welcome to IPFS',
      icon: config.logo.ice,
      show: false,
      // resizable: false,
      width: 850,
      height: 450
    })

    // Only show the window when the contents have finished loading.
    window.on('ready-to-show', () => {
      window.show()
      window.focus()
    })

    // window.setMenu(null)
    window.loadURL(`file://${__dirname}/views/welcome.html`)

    // Send the default path as soon as the window is ready.
    window.webContents.on('did-finish-load', () => {
      window.webContents.send('setup-config-path', path)
    })

    window.once('close', () => {
      if (!ipfs) app.quit()
    })

    ipcMain.on('setup-browse-path', () => {
      dialog.showOpenDialog(window, {
        title: 'Select a directory',
        defaultPath: path,
        properties: [
          'openDirectory',
          'createDirectory'
        ]
      }, (res) => {
        if (!res) return

        let userPath = res[0]

        if (!userPath.match(/.ipfs\/?$/)) {
          userPath = join(userPath, '.ipfs')
        }

        window.webContents.send('setup-config-path', userPath)
      })
    })

    ipcMain.on('install', async (event, opts) => {
      window.webContents.send('initializing')

      try {
        ipfs = await getIpfs(opts)
        window.close()
        resolve(ipfs)
      } catch (_) {
        window.webContents.send('errored')
      }
    })
  })
}

export default async function init () {
  // const opts = applyDefaults(config.settingsStore.get('connection', {}))
  const opts = {
    type: 'go',
    path: config.settingsStore.get('ipfsPath'),
    flags: []
  }

  let ipfs

  try {
    ipfs = await getIpfs(opts)
  } catch (_) {
    ipfs = await welcome(opts)
  }

  console.log(await ipfs.api.id())
}
