import {clipboard, ipcMain, globalShortcut} from 'electron'

const settingsOption = 'screenshotShortcut'
const shortcut = 'CommandOrControl+Alt+S'

function makeScreenshotDir (opts) {
  const {ipfs} = opts

  return new Promise((resolve, reject) => {
    ipfs().files.stat('/screenshots')
      .then(resolve)
      .catch(() => {
        ipfs().files.mkdir('/screenshots')
          .then(resolve)
          .catch(reject)
      })
  })
}

function handleScreenshot (opts) {
  let {debug, ipfs, send} = opts

  return (event, image) => {
    let base64Data = image.replace(/^data:image\/png;base64,/, '')

    debug('Screenshot taken')

    if (!ipfs()) {
      debug('Daemon not running. Aborting screenshot upload.')
      return
    }

    const path = `/screenshots/${new Date().toISOString()}.png`
    const content = Buffer.from(base64Data, 'base64')

    makeScreenshotDir(opts)
      .then(() => ipfs().files.write(path, content, {create: true}))
      .then(() => ipfs().files.stat(path))
      .then((res) => {
        const url = `https://ipfs.io/ipfs/${res.hash}`
        clipboard.writeText(url)
        send('files-updated')
        debug('Screenshot uploaded', {path: path})
      })
      .catch(e => { debug(e.stack) })
  }
}

export default function (opts) {
  let {send, debug, settingsStore} = opts

  let activate = (value, oldValue) => {
    if (value === oldValue) return

    if (value === true) {
      globalShortcut.register(shortcut, () => {
        debug('Taking Screenshot')
        send('screenshot')
      })
      debug('Screenshot shortcut enabled')
    } else {
      globalShortcut.unregister(shortcut)
      debug('Screenshot shortcut disabled')
    }
  }

  activate(settingsStore.get(settingsOption))
  settingsStore.on(settingsOption, activate)
  ipcMain.on('screenshot', handleScreenshot(opts))
}
