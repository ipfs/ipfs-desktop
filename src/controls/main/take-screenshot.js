import {clipboard, ipcMain, globalShortcut} from 'electron'

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
      .add(Buffer.from(base64Data, 'base64'))
      .then((res) => {
        res.forEach((file) => {
          const url = `https://ipfs.io/ipfs/${file.hash}`
          clipboard.writeText(url)
          logger.info('Screenshot uploaded', {path: file.path})
          fileHistory.add(file.path, file.hash)
        })
      })
      .catch(logger.error)
  }
}

export default function (opts) {
  let {send, logger, userSettings} = opts

  globalShortcut.register('CommandOrControl+Alt+S', () => {
    if (!userSettings.get('screenshotShortcut')) {
      return
    }

    logger.info('Taking Screenshot')
    send('screenshot')
  })

  ipcMain.on('screenshot', handleScreenshot(opts))
}
