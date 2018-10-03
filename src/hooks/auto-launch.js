import AutoLaunch from 'auto-launch'
import { store, logger } from '../utils'
import { createToggler } from './utils'

const settingsOption = 'autoLaunch'
const autoLauncher = new AutoLaunch({
  name: 'IPFS Desktop'
})

export default function (opts) {
  let activate = async (value, oldValue) => {
    if (value === oldValue) return

    try {
      if (value === true) {
        await autoLauncher.enable()
        logger.info('Launch on startup enabled')
      } else {
        await autoLauncher.disable()
        logger.info('Launch on startup disabled')
      }
    } catch (e) {
      logger.error(e.stack)
    }
  }

  activate(store.get(settingsOption, false))
  createToggler(opts, 'config.toggleAutoLaunch', settingsOption, activate)
}
