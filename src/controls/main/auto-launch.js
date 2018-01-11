const AutoLaunch = require('auto-launch')

const settingsOption = 'autoLaunch'
const autoLauncher = new AutoLaunch({
  name: 'IPFS Desktop'
})

export default function (opts) {
  let {debug, settingsStore} = opts

  let activate = (value, oldValue) => {
    if (value === oldValue) return

    if (value === true) {
      autoLauncher.enable()
        .then(() => { debug('Launch on startup enabled') })
        .catch(e => { debug(e.stack) })
    } else {
      autoLauncher.disable()
        .then(() => { debug('Launch on startup disabled') })
        .catch(e => { debug(e.stack) })
    }
  }

  activate(settingsStore.get(settingsOption))
  settingsStore.on(settingsOption, activate)
}
