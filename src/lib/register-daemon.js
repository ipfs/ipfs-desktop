import { store, createDaemon, logger } from '../utils'
import { app, ipcMain } from 'electron'
import fs from 'fs-extra'
import { join } from 'path'

export const STATUS = {
  STARTING_STARTED: 1,
  STARTING_FINISHED: 2,
  STARTING_FAILED: 3,
  STOPPING_STARTED: 4,
  STOPPING_FINISHED: 5,
  STOPPING_FAILED: 6
}

export default async function (ctx) {
  let config = store.get('ipfsConfig')
  let ipfsd = null
  let status = null

  const updateStatus = (stat) => {
    status = stat
    ipcMain.emit('ipfsd', status)
  }

  ipcMain.on('requireIpfsdStatus', () => {
    ipcMain.emit('ipfsd', status)
  })

  ctx.getIpfsd = () => ipfsd

  const startIpfs = async () => {
    if (ipfsd) {
      return
    }

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
      logger.error('[ipfsd] %v', err)
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
      ipfsdObj.stop(err => {
        if (err) {
          logger.error('[ipfsd] %v', err)
          updateStatus(STATUS.STOPPING_FAILED)
          return resolve(err)
        }

        logger.info('[ipfsd] daemon stopped')
        updateStatus(STATUS.STOPPING_FINISHED)
        resolve()
      })
    })
  }

  ipcMain.on('startIpfs', () => {
    startIpfs()
  })

  ipcMain.on('stopIpfs', () => {
    stopIpfs()
  })

  ipcMain.on('restartIpfs', async () => {
    await stopIpfs()
    await startIpfs()
  })

  await startIpfs()

  app.on('before-quit', async () => {
    await stopIpfs()
  })
}
