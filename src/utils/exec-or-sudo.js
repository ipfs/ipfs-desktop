import i18n from 'i18next'
import sudo from 'sudo-prompt'
import { dialog, app } from 'electron'
import logger from './logger'
import { recoverableErrorDialog } from '../dialogs'
import util from 'util'

const execFile = util.promisify(require('child_process').execFile)

const env = {
  noSudo: {
    ELECTRON_RUN_AS_NODE: 1
  },
  sudo: 'env ELECTRON_RUN_AS_NODE=1'
}

const getResult = (err, stdout, stderr, scope) => {
  if (stdout) {
    logger.info(`[${scope}] stdout: ${stdout.toString().trim()}`)
  }

  if (stderr) {
    logger.info(`[${scope}] stderr: ${stderr.toString().trim()}`)
  }

  if (!err) {
    return true
  }

  const str = err.toString()
  logger.error(`[${scope}] error: ${str}`)

  if (process.env.NODE_ENV !== 'test') {
    if (str.includes('No polkit authentication agent found')) {
      dialog.showErrorBox(i18n.t('polkitDialog.title'), i18n.t('polkitDialog.message'))
    } else if (str.includes('User did not grant permission')) {
      dialog.showErrorBox(i18n.t('noPermissionDialog.title'), i18n.t('noPermissionDialog.message'))
    } else {
      recoverableErrorDialog(err)
    }
  }

  return false
}

export default async function ({ script, scope, trySudo = true }) {
  const dataArg = `--data="${app.getPath('userData')}"`

  // First try without any advanced permissions.
  try {
    const { stdout } = await execFile(process.execPath, [script, dataArg], { env: env.noSudo })
    logger.info(`[${scope}] stdout: ${stdout.toString().trim()}`)
    return true
  } catch ({ stderr }) {
    if (!trySudo) {
      logger.info(`[${scope}] stderr: ${stderr.toString().trim()}`)
      return false
    }
  }

  const command = `${env.sudo} "${process.execPath}" "${script}" ${dataArg}`
  return new Promise(resolve => {
    sudo.exec(command, { name: 'IPFS Desktop' }, (err, stdout, stderr) => {
      resolve(getResult(err, stdout, stderr, scope))
    })
  })
}
