import { ipcMain } from 'electron'
import { Connection, logger, logo, store } from '../utils'

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
    send('config.changed', store.store)
  } catch (e) {
    logger.error(e)
    send('config.ipfs.addError', e)
  }
}

const removeConfiguration = ({ connManager, send }) => async (_, id) => {
  try {
    logger.info(`Removing configuration ${id}`)
    await connManager.removeConnection(id)
    store.delete(`configs.${id}`)
    logger.info('Removed!')
    send('config.changed', store.store)
  } catch (e) {
    logger.error(e)
    send('config.ipfs.removeError', e)
  }
}

const stopIpfs = ({ connManager, send }) => async () => {
  try {
    await connManager.disconnect()
  } catch (e) {
    logger.error(e)
    send('ipfs.stopError', e)
  }
}

const startIpfs = ({ connManager, send }) => async (_, id) => {
  try {
    await connManager.connect(id)
  } catch (e) {
    logger.error(e)
    send('ipfs.startError', e)
  }
}

const ipfsState = ({ connManager, send }) => async () => {
  if (connManager.running) {
    send('ipfs.started', connManager.currentId, {
      ...(await connManager.api.id()),
      apiAddress: await connManager.apiAddress(),
      gatewayAddress: await connManager.gatewayAddress()
    })
  } else {
    send('ipfs.stopped')
  }
}

const getPeers = ({ send, connManager }) => async () => {
  if (connManager.running) {
    const peers = await connManager.api.swarm.peers()
    send('peersCount', peers.length)
  } else {
    send('peersCount', 0)
  }
}

export default function (opts) {
  const { connManager, menubar } = opts

  ipcMain.on('config.ipfs.add', addConfiguration(opts))
  ipcMain.on('config.ipfs.remove', removeConfiguration(opts))
  ipcMain.on('ipfs.stop', stopIpfs(opts))
  ipcMain.on('ipfs.start', startIpfs(opts))
  ipcMain.on('ipfs.running', ipfsState(opts))

  connManager.on('started', () => {
    ipfsState(opts)()
    menubar.tray.setImage(logo('ice'))
  })

  connManager.on('stopped', () => {
    ipfsState(opts)()
    menubar.tray.setImage(logo('black'))
  })

  setInterval(getPeers(opts), 5000)
}
