import os from 'os'
import { join } from 'path'
import i18n from 'i18next'
import { execFile } from 'child_process'
import { createToggler } from '../utils'
import { logger, store } from '../../utils'
import { ipcMain, app, dialog } from 'electron'

const SETTINGS_OPTION = 'ipfsOnPath'

export default async function (ctx) {
  if (os.platform() === 'win32') {
    // TODO(future): on Windows it is still done
    // during installation. We need to find a way
    // to modify Windows PATH during runtime
    // through a command line script.
    return
  }

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

  if (app.dock) app.dock.show()

  const option = dialog.showMessageBox({
    type: 'info',
    message: i18n.t('ipfsOnPath'),
    detail: i18n.t('addIpfsToPathMessage'),
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

// TODO: use sudo-prompt
// TODO: asarUnpack install.js ipfs.sh and uninstall.js

function run (script) {
  return new Promise(resolve => {
    const args = [
      join(__dirname, `./scripts/${script}.js`),
      '--',
      `--user-data=${app.getPath('userData')}`
    ]

    const options = {
      env: {
        ELECTRON_RUN_AS_NODE: 1
      }
    }

    execFile(process.execPath, args, options, (err, stdout) => {
      if (err) {
        // TODO: tell the user
        logger.error(`[ipfs on path] ${err.toString()}`)
        return resolve(false)
      }

      logger.info(`[ipfs on path] ${stdout.toString().trim()}`)
      return resolve(true)
    })
  })
}
