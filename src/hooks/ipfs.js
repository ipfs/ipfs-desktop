import { ipcMain } from 'electron'
import { Connection, logger, store } from '../utils'

const addConfiguration = ({ connManager, send }) => async (_, opts) => {
  try {
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
  } catch (e) {
    logger.error(e)
    send('addIpfsConfigurationError', e)
  }
}

const removeConfiguration = ({ connManager, send }) => async (_, id) => {
  try {
    await connManager.removeConfiguration(id)
    store.delete(`configs.${id}`)
  } catch (e) {
    logger.error(e)
    send('removeIpfsConfigurationError', e)
  }
}

const connectToConfiguration = ({ connManager, send }) => async (_, id) => {
  try {
    await connManager.connect(id)
  } catch (e) {
    logger.error(e)
    send('connectIpfsConfigurationError', e)
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

export default function (opts) {
  ipcMain.on('addIpfsConfiguration', addConfiguration(opts))
  ipcMain.on('removeIpfsConfiguration', removeConfiguration(opts))
  ipcMain.on('connectToIpfsConfiguration', connectToConfiguration(opts))
  ipcMain.on('stopIpfs', stopIpfs(opts))
}
