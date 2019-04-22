import AutoLaunch from 'auto-launch'
import { store, logger } from '../utils'
import { createToggler } from './utils'

const settingsOption = 'autoLaunch'
const autoLauncher = new AutoLaunch({
  name: 'IPFS Desktop'
})

export default function (ctx) {
  let activate = async (value, oldValue) => {
    if (process.env.NODE_ENV === 'development') {
      logger.info('[launch on startup] unavailable during development')
      return
    }

    if (value === oldValue) return

    try {
      if (value === true) {
        if (!await autoLauncher.isEnabled()) await autoLauncher.enable()
        logger.info('[launch on startup] enabled')
      } else {
        if (await autoLauncher.isEnabled()) await autoLauncher.disable()
        logger.info('[launch on startup] disabled')
      }

      return true
    } catch (e) {
      logger.error(e.stack)
      return false
    }
  }

  activate(store.get(settingsOption, false))
  createToggler(ctx, settingsOption, activate)
}
