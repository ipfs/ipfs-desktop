import { ipcMain } from 'electron'
import filesize from 'filesize'
import { logger } from '../utils'

const ipfsState = (ctx) => async () => {
  const { getIpfsd, sendToMenubar } = ctx
  const ipfsd = getIpfsd()

  if (ipfsd && ipfsd.started) {
    sendToMenubar('ipfs.started', (await ipfsd.api.id()))
    getPeers(ctx)()
    getRepoSize(ctx)()
  } else {
    sendToMenubar('ipfs.stopped')
  }
}

const getPeers = ({ sendToMenubar, getIpfsd }) => async () => {
  const ipfsd = getIpfsd()

  if (ipfsd && ipfsd.started) {
    const peers = await ipfsd.api.swarm.peers()
    sendToMenubar('peersCount', peers.length)
  } else {
    sendToMenubar('peersCount', 0)
  }
}

const getRepoSize = ({ sendToMenubar, getIpfsd }) => async () => {
  const ipfsd = getIpfsd()

  if (ipfsd && ipfsd.started) {
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

  ipcMain.on('ipfs.toggle', async () => {
    try {
      if (ctx.getIpfsd()) {
        await ctx.stopIpfs()
      } else {
        await ctx.startIpfs()
      }

      ipfsState(ctx)()
    } catch (e) {
      logger.error(e)
    }
  })

  setInterval(getPeers(ctx), 30 * 1000)
  setInterval(getRepoSize(ctx), 60 * 60 * 1000)
}
