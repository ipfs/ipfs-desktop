import { ipcMain } from 'electron'
import filesize from 'filesize'

const ipfsState = (ctx) => async () => {
  const { ipfsd, sendToMenubar } = ctx

  if (ipfsd.started) {
    sendToMenubar('ipfs.started', (await ipfsd.api.id()))
    getPeers(ctx)()
    getRepoSize(ctx)()
  } else {
    sendToMenubar('ipfs.stopped')
  }
}

const getPeers = ({ sendToMenubar, ipfsd }) => async () => {
  if (ipfsd.started) {
    const peers = await ipfsd.api.swarm.peers()
    sendToMenubar('peersCount', peers.length)
  } else {
    sendToMenubar('peersCount', 0)
  }
}

const getRepoSize = ({ sendToMenubar, ipfsd }) => async () => {
  if (ipfsd.started) {
    const stats = await ipfsd.api.repo.stat()
    const size = stats.repoSize.toFixed(0)
    sendToMenubar('repoSize', filesize(size, { round: 0 }))
  } else {
    sendToMenubar('repoSize', null)
  }
}

export default function (ctx) {
  ipcMain.on('ipfs.running', ipfsState(ctx))
  ipfsState(ctx)()

  setInterval(getPeers(ctx), 30 * 1000)
  setInterval(getRepoSize(ctx), 60 * 60 * 1000)
}
