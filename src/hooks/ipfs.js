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
    connManager.addConfiguration(conn)

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
    await connManager.removeConfiguration(id)
    store.delete(`configs.${id}`)
    logger.info('Removed!')
  } catch (e) {
    logger.error(e)
    send('removeIpfsConfigurationError', e)
  }
}

const connectToConfiguration = ({ connManager, send }) => async (_, id) => {
  try {
    logger.info(`Connecting to IPFS configuration ${id}`)
    await connManager.connect(id)
    logger.info('Connected!')
  } catch (e) {
    logger.error(e)
    send('connectIpfsConfigurationError', e)
  }
}

const stopIpfs = ({ connManager, send }) => async () => {
  try {
    logger.info('Stopping IPFS')
    await connManager.disconnect()
    logger.info('IPFS stopped')
  } catch (e) {
    logger.error(e)
    send('stopIpfsError', e)
  }
}

const startIpfs = ({ connManager, send }) => async () => {
  try {
    logger.info('Starting IPFS')
    await connManager.connect()
    logger.info('IPFS started')
  } catch (e) {
    logger.error(e)
    send('startIpfsError', e)
  }
}

export default function (opts) {
  ipcMain.on('addIpfsConfiguration', addConfiguration(opts))
  ipcMain.on('removeIpfsConfiguration', removeConfiguration(opts))
  ipcMain.on('connectToIpfsConfiguration', connectToConfiguration(opts))
  ipcMain.on('stopIpfs', stopIpfs(opts))
  ipcMain.on('startIpfs', startIpfs(opts))
}
