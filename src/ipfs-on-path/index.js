const { join } = require('path')
const i18n = require('i18next')
const which = require('which')
const { execFile } = require('child_process')
const createToggler = require('../utils/create-toggler')
const execOrSudo = require('../utils/exec-or-sudo')
const logger = require('../common/logger')
const store = require('../common/store')
const { IS_WIN } = require('../common/consts')
const { recoverableErrorDialog } = require('../dialogs')

const CONFIG_KEY = 'ipfsOnPath'

module.exports = async function (ctx) {
  createToggler(ctx, CONFIG_KEY, async (value, oldValue) => {
    if (value === oldValue || (oldValue === null && !value)) return
    if (value === true) return run('install')
    return run('uninstall')
  })

  firstTime()
}

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
  const res = await run('install', { trySudo: false, failSilently: true })
  store.set(CONFIG_KEY, res)
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
          recoverableErrorDialog(err, {
            title: i18n.t('cantAddIpfsToPath.title'),
            message: i18n.t('cantAddIpfsToPath.message')
          })
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
    failSilently
  })
}
