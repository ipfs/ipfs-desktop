import os from 'os'
import i18n from 'i18next'
import sudo from 'sudo-prompt'
import { dialog, app } from 'electron'
import { execFile } from 'child_process'
import logger from './logger'
import { recoverableErrorDialog } from '../dialogs'

export default async function (script, scope) {
  const dataArg = `--data="${app.getPath('userData')}"`

  const getResult = (err, stdout, stderr) => {
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

  return new Promise(resolve => {
    if (os.platform() === 'darwin') {
      return execFile(process.execPath, [script, dataArg], {
        env: {
          ELECTRON_RUN_AS_NODE: 1
        }
      }, (err, stdout, stderr) => {
        resolve(getResult(err, stdout, stderr))
      })
    }

    const command = `env ELECTRON_RUN_AS_NODE=1 "${process.execPath}" "${script}" ${dataArg}`
    sudo.exec(command, { name: 'IPFS Desktop' }, (err, stdout, stderr) => {
      resolve(getResult(err, stdout, stderr))
    })
  })
}
