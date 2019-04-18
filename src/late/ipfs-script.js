import fs from 'fs-extra'
import { join } from 'path'
import os from 'os'
import i18n from 'i18next'
import { execFileSync } from 'child_process'
import { logger, store } from '../utils'
import { app, dialog } from 'electron'

const SOURCE_SCRIPT = join(__dirname, '../../../bin/ipfs.sh')
const DEST_SCRIPT = '/usr/local/bin/ipfs'

export default async function () {
  // During runtime, we only do this for darwin.
  if (os.platform() !== 'darwin') {
    return
  }

  // Check if we've done this before.
  if (store.get('ipfsOnPath', null) !== null) {
    logger.info('[ipfs on path] no action taken')
    return
  }

  await addToPath(() => {
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
    return option === 1
  })
}

export async function addToPath (confirmationCb) {
  if (os.platform() !== 'darwin') {
    logger.info('[ipfs on path] no action taken: not macOS')
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

    if (typeof confirmationCb === 'function') {
      if (!await confirmationCb()) {
        store.set('ipfsOnPath', false)
        logger.info('[ipfs on path] was not added, user action')
        return
      }
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
    store.set('ipfsOnPath', true)
  } catch (e) {
    logger.error(e)
  }
}
