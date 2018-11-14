import { ipcMain } from 'electron'
import filesize from 'filesize'

const ipfsState = ({ ipfsd, menubarWindow: { send } }) => async () => {
  if (ipfsd.started) {
    send('ipfs.started', (await ipfsd.api.id()), {
      api: ipfsd.apiAddr,
      gateway: ipfsd.gatewayAddr
    })
  } else {
    send('ipfs.stopped')
  }
}

const getPeers = ({ menubarWindow: { send }, ipfsd }) => async () => {
  if (ipfsd.started) {
    const peers = await ipfsd.api.swarm.peers()
    send('peersCount', peers.length)
  } else {
    send('peersCount', 0)
  }
}

const getRepoSize = ({ menubarWindow: { send }, ipfsd }) => async () => {
  if (ipfsd.started) {
    const stats = await ipfsd.api.repo.stat()
    const size = stats.repoSize.toFixed(0)
    send('repoSize', filesize(size, { round: 0 }))
  } else {
    send('repoSize', null)
  }
}

export default function (ctx) {
  ipcMain.on('ipfs.running', ipfsState(ctx))
  ipfsState(ctx)()

  setInterval(getPeers(ctx), 5000)
  setInterval(getRepoSize(ctx), 5000)
}
