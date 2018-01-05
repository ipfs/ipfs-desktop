const AutoLaunch = require('auto-launch')

const settingsOption = 'autoLaunch'
const autoLauncher = new AutoLaunch({
  name: 'IPFS Desktop'
})

export default function (opts) {
  let {logger, settingsStore} = opts

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

  activate(settingsStore.get(settingsOption))
  settingsStore.on(settingsOption, activate)
}
