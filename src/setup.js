import { logo, getIpfs, logger, store } from './utils'
import { join } from 'path'
import fs from 'fs-extra'
import { BrowserWindow, dialog, ipcMain, app } from 'electron'

function welcome ({ path }) {
  return new Promise(resolve => {
    let ipfs = null

    // Initialize the welcome window.
    const window = new BrowserWindow({
      title: 'Welcome to IPFS',
      icon: logo('ice'),
      show: false,
      resizable: false,
      width: 850,
      height: 450
    })

    // Only show the window when the contents have finished loading.
    window.on('ready-to-show', () => {
      window.show()
      window.focus()
      logger.info('Welcome window ready')
    })

    window.setMenu(null)
    window.loadURL(`file://${__dirname}/views/welcome.html`)

    // Send the default path as soon as the window is ready.
    window.webContents.on('did-finish-load', () => {
      window.webContents.send('setup-config-path', path)
      logger.info('Welcome window has path')
    })

    window.once('close', () => {
      logger.info('Welcome screen was closed')
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

        if (!userPath.endsWith('ipfs')) {
          userPath = join(userPath, '.ipfs')
        }

        logger.info('Got new path %s', userPath)
        window.webContents.send('setup-config-path', userPath)
      })
    })

    ipcMain.on('install', async (event, opts) => {
      window.webContents.send('initializing')

      opts = {
        ...opts,
        init: !(await fs.pathExists(opts.path)) || fs.readdirSync(opts.path).length === 0
      }

      logger.info('Trying connection with: %o', opts)

      try {
        ipfs = await getIpfs(opts)

        if (opts.type === 'api') {
          await ipfs.id()
        } else {
          await ipfs.api.id()
        }

        store.set('ipfs', opts)
        window.close()
        resolve(ipfs)
      } catch (e) {
        logger.info('Connection failed with error: %o', e)
        window.webContents.send('initialization-error', e.stack)
      }
    })
  })
}

export default async function () {
  const opts = store.get('ipfs', {
    path: join(process.env.IPFS_PATH || (process.env.HOME || process.env.USERPROFILE), '.ipfs')
  })

  let ipfs

  if (Object.keys(opts).length === 1) {
    ipfs = await welcome(opts)
  } else {
    try {
      ipfs = await getIpfs(opts)
    } catch (_) {
      ipfs = await welcome(opts)
    }
  }

  return ipfs
}
