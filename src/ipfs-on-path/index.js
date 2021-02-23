const { join } = require('path')
const i18n = require('i18next')
const which = require('which')
const { execFile } = require('child_process')
const createToggler = require('../utils/create-toggler')
const execOrSudo = require('../utils/exec-or-sudo')
const logger = require('../common/logger')
const store = require('../common/store')
const { IS_WIN } = require('../common/consts')
const { showDialog, recoverableErrorDialog } = require('../dialogs')

const CONFIG_KEY = 'ipfsOnPath'

const errorMessage = {
  title: i18n.t('cantAddIpfsToPath.title'),
  message: i18n.t('cantAddIpfsToPath.message')
}

module.exports = async function () {
  createToggler(CONFIG_KEY, async ({ newValue, oldValue }) => {
    if (newValue === oldValue || (oldValue === null && !newValue)) {
      return
    }

    if (newValue === true) {
      if (showDialog({
        title: i18n.t('enableIpfsOnPath.title'),
        message: i18n.t('enableIpfsOnPath.message'),
        buttons: [
          i18n.t('enableIpfsOnPath.action'),
          i18n.t('cancel')
        ]
      }) !== 0) {
        // User canceled
        return
      }

      return run('install')
    }

    if (showDialog({
      title: i18n.t('disableIpfsOnPath.title'),
      message: i18n.t('disableIpfsOnPath.message'),
      buttons: [
        i18n.t('disableIpfsOnPath.action'),
        i18n.t('cancel')
      ]
    }) !== 0) {
      // User canceled
      return
    }

    return run('uninstall')
  })

  firstTime()
}

module.exports.CONFIG_KEY = CONFIG_KEY

async function firstTime () {
  // Check if we've done this before.
  if (store.get(CONFIG_KEY, null) !== null) {
    logger.info('[ipfs on path] no action taken')
    return
  }

  if (which.sync('ipfs', { nothrow: true }) !== null) {
    // ipfs already exists on user's system so we won't take any action
    // by default. Doesn't try again next time.
    store.set(CONFIG_KEY, false)
    return
  }

  // Tries to install ipfs-on-path on the system. It doesn't try to elevate
  // to sudo so the user doesn't get annoying prompts when running IPFS Desktop
  // for the first time. Sets the option according to the success or failure of the
  // procedure.
  try {
    const res = await run('install', { trySudo: false, failSilently: true })
    store.set(CONFIG_KEY, res)
  } catch (err) {
    logger.error(`[ipfs on path] unexpected error while no-sudo install: ${err.toString()}`)
    store.set(CONFIG_KEY, false)
  }
}

async function runWindows (script, { failSilently }) {
  return new Promise(resolve => {
    execFile('powershell.exe', [
      '-nop', '-exec', 'bypass',
      '-win', 'hidden', '-File',
      join(__dirname, `scripts/${script}.ps1`).replace('app.asar', 'app.asar.unpacked')
    ], {}, err => {
      if (err) {
        logger.error(`[ipfs on path] ${err.toString()}`)

        if (!failSilently) {
          recoverableErrorDialog(err, errorMessage)
        }

        return resolve(false)
      }

      logger.info(`[ipfs on path] ${script}ed`)
      resolve(true)
    })
  })
}

async function run (script, { trySudo = true, failSilently = false } = {}) {
  if (IS_WIN) {
    return runWindows(script, { failSilently })
  }

  return execOrSudo({
    script: join(__dirname, `./scripts/${script}.js`),
    scope: 'ipfs on path',
    trySudo,
    failSilently,
    errorOptions: errorMessage
  })
}
