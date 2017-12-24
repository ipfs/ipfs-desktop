const AutoLaunch = require('auto-launch')

const settingsOption = 'autoLaunch'
const autoLauncher = new AutoLaunch({
  name: 'IPFS Station'
})

export default function (opts) {
  let {logger, userSettings} = opts

  let activate = (value) => {
    if (value === true) {
      autoLauncher.enable().catch(logger.error)
    } else {
      autoLauncher.disable().catch(logger.error)
    }
  }

  activate(userSettings.get(settingsOption))
  userSettings.on(settingsOption, activate)
}
