import autoLaunch from './auto-launch'
import downloadHash from './download-hash'
import takeScreenshot from './take-screenshot'

export default function (opts) {
  autoLaunch(opts)
  downloadHash(opts)
  takeScreenshot(opts)
}
