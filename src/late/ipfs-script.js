import fs from 'fs-extra'
import { join } from 'path'
import os from 'os'
import { execFileSync } from 'child_process'
import { logger, i18n } from '../utils'
import { app, dialog } from 'electron'

const SOURCE_SCRIPT = join(__dirname, '../../../bin/ipfs.sh')
const DEST_SCRIPT = '/usr/local/bin/ipfs'

export default async function () {
  // During runtime, we only do this for darwin.
  if (os.platform() !== 'darwin') {
    return
  }

  let exists = false
  try {
    await fs.lstat(DEST_SCRIPT)
    exists = true
  } catch (_) {
    // doesn't exist
  }

  if (exists) {
    try {
      const link = await fs.readlink(DEST_SCRIPT)

      if (link === SOURCE_SCRIPT) {
        logger.info('[ipfs on path] already symlinked')
        return
      }
    } catch (_) {
      // DEST_SCRIPT is not a symlink, ignore.
    }
  }

  try {
    execFileSync('ipfs')
    exists = true
  } catch (e) {
    logger.error(e)
    // 'ipfs' gave a non-zero code or timed out => doesn't exist
  }

  if (exists) {
    if (app.dock) app.dock.show()

    const option = dialog.showMessageBox({
      type: 'info',
      message: i18n.t('ipfsOnPath'),
      detail: i18n.t('addIpfsToPath'),
      buttons: [
        i18n.t('no'),
        i18n.t('yes')
      ],
      cancelId: 0
    })

    if (app.dock) app.dock.hide()

    if (option !== 1) {
      logger.info('[ipfs on path] was not added, user action')
      return
    }
  }

  // Ignore during development because the paths are not the same.
  if (process.env.NODE_ENV === 'development') {
    logger.info('[ipfs on path] unavailable during development')
    return
  }

  try {
    if (exists) await fs.unlink(DEST_SCRIPT)
    await fs.ensureSymlink(SOURCE_SCRIPT, DEST_SCRIPT)
    logger.info('[ipfs on path] added to %s', DEST_SCRIPT)
  } catch (e) {
    logger.error(e)
  }
}
