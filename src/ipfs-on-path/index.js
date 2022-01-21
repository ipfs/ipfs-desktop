const { join } = require('path')
const i18n = require('i18next')
const { app, shell } = require('electron')
const { execFile } = require('child_process')
const execOrSudo = require('../utils/exec-or-sudo')
const logger = require('../common/logger')
const store = require('../common/store')
const { IS_WIN } = require('../common/consts')
const { showDialog } = require('../dialogs')
const { unlinkSync } = require('fs')

const CONFIG_KEY = 'ipfsOnPath'

// Deprecated in February 2021 https://github.com/ipfs/ipfs-desktop/pull/1768
// Once this bit of code is removed, also remove ../utils/exec-or-sudo.
module.exports = async function () {
  if (store.get(CONFIG_KEY, null) === true) {
    try {
      await uninstall('uninstall')
    } catch (err) {
      // Weird, but not worth bothering.
      logger.error(`[ipfs on path] ${err.toString()}`)
    }

    try {
      unlinkSync(join(app.getPath('home'), './.ipfs-desktop/IPFS_PATH').replace('app.asar', 'app.asar.unpacked'))
      unlinkSync(join(app.getPath('home'), './.ipfs-desktop/IPFS_EXEC').replace('app.asar', 'app.asar.unpacked'))
    } catch (err) {
      // Weird, but not worth bothering.
      logger.error(`[ipfs on path] ${err.toString()}`)
    }

    logger.info('[ipfs on path] uninstalled')

    const opt = showDialog({
      title: 'Command Line Tools Uninstalled',
      message: 'Command Line Tools via IPFS Desktop have been deprecated in February 2021. They have now been uninstalled. Please refer to https://docs.ipfs.io/install/command-line/ if you need to use ipfs from the command line.',
      buttons: [
        i18n.t('openCliDocumentation'),
        i18n.t('close')
      ]
    })

    if (opt === 0) {
      shell.openExternal('https://docs.ipfs.io/install/command-line/')
    }
  }

  store.delete(CONFIG_KEY)
}

async function uninstallWindows () {
  return new Promise((resolve, reject) => {
    execFile('powershell.exe', [
      '-nop', '-exec', 'bypass',
      '-win', 'hidden', '-File',
      join(__dirname, 'scripts/uninstall.ps1').replace('app.asar', 'app.asar.unpacked')
    ], {}, err => {
      if (err) {
        return reject(err)
      }

      resolve()
    })
  })
}

async function uninstall () {
  if (IS_WIN) {
    return uninstallWindows()
  }

  return execOrSudo({
    script: join(__dirname, './scripts/uninstall.js'),
    scope: 'ipfs on path',
    trySudo: true,
    failSilently: true
  })
}
