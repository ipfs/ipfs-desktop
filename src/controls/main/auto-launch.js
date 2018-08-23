import AutoLaunch from 'auto-launch'
import { store, logger } from '../../utils'

const settingsOption = 'autoLaunch'
const autoLauncher = new AutoLaunch({
  name: 'IPFS Desktop'
})

export default function () {
  let activate = (value, oldValue) => {
    if (value === oldValue) return

    if (value === true) {
      autoLauncher.enable()
        .then(() => { logger.info('Launch on startup enabled') })
        .catch(e => { logger.error(e.stack) })
    } else {
      autoLauncher.disable()
        .then(() => { logger.info('Launch on startup disabled') })
        .catch(e => { logger.error(e.stack) })
    }
  }

  activate(store.get(settingsOption))
  store.onDidChange(settingsOption, activate)
}
