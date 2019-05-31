import { store, createDaemon, logger } from '../utils'
import { app, ipcMain } from 'electron'
import fs from 'fs-extra'
import { join } from 'path'
import { ipfsNotRunningDialog } from '../dialogs'

export const STATUS = {
  STARTING_STARTED: 1,
  STARTING_FINISHED: 2,
  STARTING_FAILED: 3,
  STOPPING_STARTED: 4,
  STOPPING_FINISHED: 5,
  STOPPING_FAILED: 6
}

export default async function (ctx) {
  let ipfsd = null
  let status = null
  let wasOnline = null

  const updateStatus = (stat) => {
    status = stat
    ipcMain.emit('ipfsd', status)
  }

  ipcMain.on('requireIpfsdStatus', () => {
    ipcMain.emit('ipfsd', status)
  })

  ctx.getIpfsd = async (optional = false) => {
    if (optional) {
      return ipfsd
    }

    if (!ipfsd) {
      await ipfsNotRunningDialog()
    }

    return ipfsd
  }

  const startIpfs = async () => {
    if (ipfsd) {
      return
    }

    let config = store.get('ipfsConfig')
    logger.info('[ipfsd] starting daemon')
    updateStatus(STATUS.STARTING_STARTED)

    try {
      ipfsd = await createDaemon(config)

      // Update the path if it was blank previously.
      // This way we use the default path when it is
      // not set.
      if (config.path === '') {
        config.path = ipfsd.repoPath
        store.set('ipfsConfig', config)
      }

      logger.info('[ipfsd] daemon started')
      updateStatus(STATUS.STARTING_FINISHED)
    } catch (err) {
      logger.error('[ipfsd]', err)
      updateStatus(STATUS.STARTING_FAILED)
    }
  }

  const stopIpfs = async () => {
    if (!ipfsd) {
      return
    }

    logger.info('[ipfsd] stopping daemon')
    updateStatus(STATUS.STOPPING_STARTED)

    if (!fs.pathExists(join(ipfsd.repoPath, 'config'))) {
      // Is remote api... ignore
      ipfsd = null
      updateStatus(STATUS.STOPPING_FINISHED)
      return
    }

    return new Promise(resolve => {
      const ipfsdObj = ipfsd
      ipfsd = null
      // give ipfs 3s to stop. An unclean shutdown is preferable to making the
      // user wait, and taking longer prevents the update mechanism from working.
      ipfsdObj.stop(180, err => {
        if (err) {
          logger.error('[ipfsd] ', err)
          updateStatus(STATUS.STOPPING_FAILED)
          return resolve(err)
        }

        logger.info('[ipfsd] daemon stopped')
        updateStatus(STATUS.STOPPING_FINISHED)
        resolve()
      })
    })
  }

  const restartIpfs = async () => {
    await stopIpfs()
    await startIpfs()
  }

  ipcMain.on('startIpfs', startIpfs)
  ipcMain.on('stopIpfs', stopIpfs)
  ipcMain.on('restartIpfs', restartIpfs)
  ipcMain.on('ipfsConfigChanged', restartIpfs)
  app.on('before-quit', stopIpfs)

  await startIpfs()

  ipcMain.on('online-status-changed', (_, isOnline) => {
    if (wasOnline === false && isOnline) {
      restartIpfs()
    }

    wasOnline = isOnline
  })
}
