import autoLaunch from './auto-launch'
import downloadHash from './download-hash'
import launchWebUI from './launch-webui'
import takeScreenshot from './take-screenshot'

export default function (opts) {
  autoLaunch(opts)
  downloadHash(opts)
  launchWebUI(opts)
  takeScreenshot(opts)
}
