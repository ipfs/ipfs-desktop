const AutoLaunch = require('auto-launch')

const settingsOption = 'autoLaunch'
const autoLauncher = new AutoLaunch({
  name: 'IPFS Station'
})

export default function (opts) {
  let {logger, settingsStore} = opts

  let activate = (value) => {
    if (value === true) {
      autoLauncher.enable().catch(logger.error)
    } else {
      autoLauncher.disable().catch(logger.error)
    }
  }

  activate(settingsStore.get(settingsOption))
  settingsStore.on(settingsOption, activate)
}
