import os from 'os'
import { join } from 'path'
import which from 'which'
import { execFile } from 'child_process'
import { createToggler } from '../utils'
import { logger, store, execOrSudo } from '../../utils'
import { ipcMain } from 'electron'
import { recoverableErrorDialog } from '../../dialogs'

const SETTINGS_OPTION = 'ipfsOnPath'

export default async function (ctx) {
  createToggler(ctx, SETTINGS_OPTION, async (value, oldValue) => {
    if (value === oldValue || (oldValue === null && !value)) return
    if (value === true) return run('install')
    return run('uninstall')
  })

  firstTime()
}

function firstTime () {
  // Check if we've done this before.
  if (store.get(SETTINGS_OPTION, null) !== null) {
    logger.info('[ipfs on path] no action taken')
    return
  }

  const isDarwin = os.platform() === 'darwin'
  const isWindows = os.platform() === 'win32'

  const ipfsExists = which.sync('ipfs', { nothrow: true }) !== null

  if ((isDarwin || isWindows) && !ipfsExists) {
    // If it's macOS or Windows and IPFS is not on user's PATH, let's add it.
    logger.info('[ipfs on path] macOS/windows + ipfs not present, installing')
    ipcMain.emit('config.toggle', null, SETTINGS_OPTION)
  } else {
    // If not, don't make this verification next time. The user can manually
    // toggle it in the Settings page.
    store.set(SETTINGS_OPTION, false)
  }
}

async function runWindows (script) {
  return new Promise(resolve => {
    execFile('powershell.exe', [
      '-nop', '-exec', 'bypass',
      '-win', 'hidden',
      join(__dirname, `scripts/${script}.ps1`).replace('app.asar', 'app.asar.unpacked')
    ], {}, err => {
      if (err) {
        logger.error(`[ipfs on path] ${err.toString()}`)
        recoverableErrorDialog(err)
        return resolve(false)
      }

      logger.info(`[ipfs on path] ${script}ed`)
      resolve(true)
    })
  })
}

async function run (script) {
  if (os.platform() === 'win32') {
    return runWindows(script)
  }

  const path = join(__dirname, `./scripts/${script}.js`)
  return execOrSudo(path, 'ipfs on path')
}
