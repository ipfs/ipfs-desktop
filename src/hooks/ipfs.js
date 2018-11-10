import { ipcMain } from 'electron'
import { logger, logo } from '../utils'

const stopIpfs = ({ conn, menubarWindow: { send } }) => async () => {
  try {
    await conn.stop()
  } catch (e) {
    logger.error(e)
    send('ipfs.stopError', e)
  }
}

const startIpfs = ({ conn, menubarWindow: { send } }) => async (_) => {
  try {
    await conn.start()
  } catch (e) {
    logger.error(e)
    send('ipfs.startError', e)
  }
}

const ipfsState = ({ conn, menubarWindow: { send } }) => async () => {
  if (conn.running) {
    send('ipfs.started', (await conn.api.id()), {
      api: await conn.apiAddress(),
      gateway: await conn.gatewayAddress()
    })
  } else {
    send('ipfs.stopped')
  }
}

const getPeers = ({ menubarWindow: { send }, conn }) => async () => {
  if (conn.running) {
    const peers = await conn.api.swarm.peers()
    send('peersCount', peers.length)
  } else {
    send('peersCount', 0)
  }
}

export default function (opts) {
  const { conn, menubarWindow } = opts

  ipcMain.on('ipfs.stop', stopIpfs(opts))
  ipcMain.on('ipfs.start', startIpfs(opts))
  ipcMain.on('ipfs.running', ipfsState(opts))

  const onStarted = () => {
    ipfsState(opts)()
    menubarWindow.it.tray.setImage(logo('ice'))
    menubarWindow.it.tray.setToolTip('IFPS running')
  }

  const onStopped = () => {
    ipfsState(opts)()
    menubarWindow.it.tray.setImage(logo('black'))
    menubarWindow.it.tray.setToolTip('IFPS stopped')
  }

  conn.running ? onStarted() : onStopped()
  conn.on('started', onStarted)
  conn.on('stopped', onStopped)

  setInterval(getPeers(opts), 5000)
}
