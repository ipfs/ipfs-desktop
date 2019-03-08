import { store, createDaemon, logger } from '../utils'
import { app, ipcMain } from 'electron'
import fs from 'fs-extra'
import { join } from 'path'

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
    updateStatus({ starting: true })

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
      updateStatus({ starting: true, done: true, data: await ipfsd.api.id() })
    } catch (err) {
      logger.error('[ipfsd] %v', err)
      updateStatus({ starting: true, failed: true, data: err })
    }
  }

  const stopIpfs = async () => {
    if (!ipfsd) {
      return
    }

    logger.info('[ipfsd] stopping daemon')
    updateStatus({ stopping: true })

    if (!fs.pathExists(join(ipfsd.repoPath, 'config'))) {
      // Is remote api... ignore
      ipfsd = null
      updateStatus({ stopping: true, done: true })
      return
    }

    return new Promise(resolve => {
      const ipfsdObj = ipfsd
      ipfsd = null
      ipfsdObj.stop(err => {
        if (err) {
          logger.error('[ipfsd] %v', err)
          updateStatus({ stopping: true, failed: true, data: err })
          return resolve(err)
        }

        logger.info('[ipfsd] daemon stopped')
        updateStatus({ stopping: true, done: true })
        resolve()
      })
    })
  }

  ipcMain.on('startIpfs', () => {
    if (!ipfsd) startIpfs()
  })

  ipcMain.on('stopIpfs', () => {
    if (ipfsd) stopIpfs()
  })

  await startIpfs()

  app.on('before-quit', async () => {
    await stopIpfs()
  })
}
