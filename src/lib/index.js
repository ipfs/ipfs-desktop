import registerDaemon from './register-daemon'
import registerMenubar from './menubar'
import registerWebUI from './webui'
import openExternal from './open-external'
import autoLaunch from './auto-launch'
import downloadHash from './download-hash'
import ipfsStats from './ipfs-stats'
import takeScreenshot from './take-screenshot'
import appMenu from './app-menu'
import addToIpfs from './add-to-ipfs'
import protocolHandlers from './protocol-handlers'

export default async function () {
  let ctx = {}
  await appMenu()
  await openExternal(ctx)
  await registerDaemon(ctx) // ctx.getIpfsd, ctx.stopIpfs, ctx.startIpfs
  await registerWebUI(ctx) // ctx.sendToWebUI, ctx.launchWebUI
  await registerMenubar(ctx) // ctx.sendToMenubar, ctx.menubar
  await addToIpfs(ctx)
  await protocolHandlers(ctx)
  await autoLaunch(ctx)
  await downloadHash(ctx)
  await takeScreenshot(ctx)
  await ipfsStats(ctx)
}
