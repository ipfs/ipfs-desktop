import {clipboard, ipcMain, globalShortcut} from 'electron'

const settingsOption = 'screenshotShortcut'
const shortcut = 'CommandOrControl+Alt+S'

function handleScreenshot (opts) {
  let {logger, fileHistory, ipfs} = opts

  return (event, image) => {
    let base64Data = image.replace(/^data:image\/png;base64,/, '')

    logger.info('Screenshot taken')

    if (!ipfs()) {
      logger.info('Daemon not running. Aborting screenshot upload.')
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
          logger.info('Screenshot uploaded', {path: file.path})
          fileHistory.add(file.path, file.hash)
        })
      })
      .catch(e => { logger.error(e.stack) })
  }
}

export default function (opts) {
  let {send, logger, settingsStore} = opts

  let activate = (value, oldValue) => {
    if (value === oldValue) return

    if (value === true) {
      globalShortcut.register(shortcut, () => {
        logger.info('Taking Screenshot')
        send('screenshot')
      })
      logger.info('Screenshot shortcut enabled')
    } else {
      globalShortcut.unregister(shortcut)
      logger.info('Screenshot shortcut disabled')
    }
  }

  activate(settingsStore.get(settingsOption))
  settingsStore.on(settingsOption, activate)
  ipcMain.on('screenshot', handleScreenshot(opts))
}
