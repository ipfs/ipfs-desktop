import { ipcMain } from 'electron'
import { Connection, logger, store } from '../utils'

const loadConfigurations = ({ send }) => () => {
  const configs = store.get('configs')
  send('ipfsConfigurations', configs)
}

const addConfiguration = ({ send }) => async (_, opts) => {
  try {
    const conn = new Connection(opts)
    if (!conn.justApi) {
      await conn.init()
    }

    const id = conn.id

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

export default function (opts) {
  ipcMain.on('loadIpfsConfigurations', loadConfigurations(opts))
  ipcMain.on('addIpfsConfiguration', addConfiguration(opts))

  // TODO:
  // ipcMain.on('connectIpfsConfiguration', )
  // ipcMain.on('stopIpfs', )
}
