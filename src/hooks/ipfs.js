import { ipcMain } from 'electron'
import { Connection, logger, logo, store } from '../utils'

const changeConfiguration = ({ connManager, menubarWindow: { send } }) => async (_, id, opts, makeDefault) => {
  try {
    logger.info('Adding/changing configuration %o', opts)
    const conn = new Connection(opts, id)
    if (!conn.justApi) {
      await conn.init()
    }

    id = conn.id
    connManager.addConnection(conn)

    store.set(`configs.${id}`, conn)

    if (makeDefault || !store.get('defaultConfig')) {
      store.set('defaultConfig', id)
    }

    logger.info('Added')
    send('config.changed', store.store)
  } catch (e) {
    logger.error(e)
    send('config.ipfs.addError', e)
  }
}

const removeConfiguration = ({ connManager, menubarWindow: { send } }) => async (_, id) => {
  try {
    logger.info(`Removing configuration ${id}`)
    await connManager.removeConnection(id)
    store.delete(`configs.${id}`)

    if (store.get('defaultConfig') === id) {
      store.delete('defaultConfig')
    }

    logger.info('Removed!')
    send('config.changed', store.store)
  } catch (e) {
    logger.error(e)
    send('config.ipfs.removeError', e)
  }
}

const stopIpfs = ({ connManager, menubarWindow: { send } }) => async () => {
  try {
    await connManager.disconnect()
  } catch (e) {
    logger.error(e)
    send('ipfs.stopError', e)
  }
}

const startIpfs = ({ connManager, menubarWindow: { send } }) => async (_, id) => {
  try {
    await connManager.connect(id)
  } catch (e) {
    logger.error(e)
    send('ipfs.startError', e)
  }
}

const ipfsState = ({ connManager, menubarWindow: { send } }) => async () => {
  if (connManager.running) {
    send('ipfs.started', connManager.currentId, (await connManager.api.id()), {
      api: await connManager.apiAddress(),
      gateway: await connManager.gatewayAddress()
    })
  } else {
    send('ipfs.stopped')
  }
}

const getPeers = ({ menubarWindow: { send }, connManager }) => async () => {
  if (connManager.running) {
    const peers = await connManager.api.swarm.peers()
    send('peersCount', peers.length)
  } else {
    send('peersCount', 0)
  }
}

export default function (opts) {
  const { connManager, menubarWindow } = opts

  ipcMain.on('config.ipfs.changed', changeConfiguration(opts))
  ipcMain.on('config.ipfs.remove', removeConfiguration(opts))
  ipcMain.on('ipfs.stop', stopIpfs(opts))
  ipcMain.on('ipfs.start', startIpfs(opts))
  ipcMain.on('ipfs.running', ipfsState(opts))

  connManager.on('started', () => {
    ipfsState(opts)()
    menubarWindow.it.tray.setImage(logo('ice'))
  })

  connManager.on('stopped', () => {
    ipfsState(opts)()
    menubarWindow.it.tray.setImage(logo('black'))
  })

  setInterval(getPeers(opts), 5000)
}
