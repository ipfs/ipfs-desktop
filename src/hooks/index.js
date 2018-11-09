import autoLaunch from './auto-launch'
import downloadHash from './download-hash'
import ipfs from './ipfs'
import webui from './webui'
import openDataFolder from './open-data-folder'
import takeScreenshot from './take-screenshot'

export default async function (opts) {
  await webui(opts)
  await autoLaunch(opts)
  await downloadHash(opts)
  await ipfs(opts)
  await openDataFolder(opts)
  await takeScreenshot(opts)
}
