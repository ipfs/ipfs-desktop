import os from 'os'
import { join } from 'path'
import i18n from 'i18next'
import sudo from 'sudo-prompt'
import which from 'which'
import { execFile } from 'child_process'
import { createToggler } from '../utils'
import { logger, store, showRecoverableError } from '../../utils'
import { ipcMain, app, dialog } from 'electron'

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
    logger.info('[ipfs on path] macOS/windows + ipfs not present, installing')
    ipcMain.emit('config.toggle', null, SETTINGS_OPTION)
    return
  }

  if (app.dock) app.dock.show()

  const suffix = isWindows ? 'Windows' : ipfsExists ? 'AlreadyExists' : 'NotExists'

  const option = dialog.showMessageBox({
    type: 'info',
    message: i18n.t('ipfsCommandLineTools'),
    detail: i18n.t('ipfsCommandLineTools' + suffix),
    buttons: [
      i18n.t('no'),
      i18n.t('yes')
    ],
    cancelId: 0
  })

  if (app.dock) app.dock.hide()

  if (option === 1) {
    // Trigger the toggler.
    ipcMain.emit('config.toggle', null, SETTINGS_OPTION)
  } else {
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
        showRecoverableError(err)
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

  const args = [
    join(__dirname, `./scripts/${script}.js`),
    '--',
    `--user-data=${app.getPath('userData')}`
  ]

  const getResult = (err, stdout, stderr) => {
    if (stdout) {
      logger.info(`[ipfs on path] stdout: ${stdout.toString().trim()}`)
    }

    if (stderr) {
      logger.info(`[ipfs on path] stderr: ${stderr.toString().trim()}`)
    }

    if (!err) {
      return true
    }

    const str = err.toString()
    logger.error(`[ipfs on path] error: ${str}`)

    if (str.includes('No polkit authentication agent found')) {
      dialog.showErrorBox(i18n.t('anErrorHasOccurred'), i18n.t('polkitNotFound'))
    } else if (str.includes('User did not grant permission')) {
      dialog.showErrorBox(i18n.t('anErrorHasOccurred'), i18n.t('noPermission'))
    } else {
      showRecoverableError(err)
    }

    return false
  }

  return new Promise(resolve => {
    if (os.platform() === 'darwin') {
      return execFile(process.execPath, args, (err, stdout, stderr) => {
        resolve(getResult(err, stdout, stderr))
      })
    }

    const command = `env ELECTRON_RUN_AS_NODE=1 ${process.execPath} ${args.join(' ')}`
    sudo.exec(command, { name: 'IPFS Desktop' }, (err, stdout, stderr) => {
      resolve(getResult(err, stdout, stderr))
    })
  })
}
