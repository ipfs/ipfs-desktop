import {clipboard, ipcMain, globalShortcut} from 'electron'

const settingsOption = 'screenshotShortcut'
const shortcut = 'CommandOrControl+Alt+S'

function handleScreenshot (opts) {
  let {debug, fileHistory, ipfs} = opts

  return (event, image) => {
    let base64Data = image.replace(/^data:image\/png;base64,/, '')

    debug('Screenshot taken')

    if (!ipfs()) {
      debug('Daemon not running. Aborting screenshot upload.')
      return
    }

    ipfs()
      .add([{
        path: `Screenshot ${new Date().toLocaleString()}.png`,
        content: Buffer.from(base64Data, 'base64')
      }])
      .then((res) => {
        res.forEach((file) => {
          const url = `https://ipfs.io/ipfs/${file.hash}`
          clipboard.writeText(url)
          debug('Screenshot uploaded', {path: file.path})
          fileHistory.add(file.path, file.hash)
        })
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
