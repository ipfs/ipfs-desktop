import { ipcMain } from 'electron'
import { Connection, logger, store } from '../utils'

const addConfiguration = ({ connManager, send }) => async (_, opts) => {
  try {
    logger.info('Adding configuration %o', opts)
    const conn = new Connection(opts)
    if (!conn.justApi) {
      await conn.init()
    }

    const id = conn.id
    connManager.addConnection(conn)

    if (!store.get(`configs.${id}`)) {
      store.set(`configs.${id}`, conn)
    }

    if (!store.get('defaultConfig')) {
      store.set('defaultConfig', id)
    }

    logger.info('Added')
  } catch (e) {
    logger.error(e)
    send('addIpfsConfigurationError', e)
  }
}

const removeConfiguration = ({ connManager, send }) => async (_, id) => {
  try {
    logger.info(`Removing configuration ${id}`)
    await connManager.removeConnection(id)
    store.delete(`configs.${id}`)
    logger.info('Removed!')
  } catch (e) {
    logger.error(e)
    send('removeIpfsConfigurationError', e)
  }
}

const stopIpfs = ({ connManager, send }) => async () => {
  try {
    await connManager.disconnect()
  } catch (e) {
    logger.error(e)
    send('stopIpfsError', e)
  }
}

const startIpfs = ({ connManager, send }) => async (_, id) => {
  try {
    await connManager.connect(id)
  } catch (e) {
    logger.error(e)
    send('startIpfsError', e)
  }
}

export default function (opts) {
  ipcMain.on('config.ipfs.add', addConfiguration(opts))
  ipcMain.on('config.ipfs.remove', removeConfiguration(opts))
  ipcMain.on('ipfs.stop', stopIpfs(opts))
  ipcMain.on('ipfs.start', startIpfs(opts))
}
