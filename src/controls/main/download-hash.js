import path from 'path'
import fs from 'fs'
import {clipboard, app, dialog, globalShortcut} from 'electron'
import {validateIPFS} from '../utils'

const settingsOption = 'downloadHashShortcut'
const shortcut = 'CommandOrControl+Alt+D'

function selectDirectory (opts) {
  const {menubar} = opts

  return new Promise((resolve, reject) => {
    dialog.showOpenDialog(menubar.window, {
      title: 'Select a directory',
      defaultPath: app.getPath('downloads'),
      properties: [
        'openDirectory',
        'createDirectory'
      ]
    }, (res) => {
      if (!res || res.length === 0) {
        resolve()
      } else {
        resolve(res[0])
      }
    })
  })
}

function saveFile (opts, dir, file) {
  const {logger} = opts
  const location = path.join(dir, file.path)

  if (fs.existsSync(location)) {
    // Ignore the hash itself.
    return
  }

  fs.writeFile(location, file.content, (err) => {
    if (err) {
      logger.error(err.stack)
    } else {
      logger.info(`File '${file.path}' downloaded to ${location}.`)
    }
  })
}

function handler (opts) {
  const {logger, ipfs} = opts

  return () => {
    const text = clipboard.readText().trim()

    if (!ipfs() || !text) {
      return
    }

    if (!validateIPFS(text)) {
      dialog.showErrorBox(
        'Invalid Hash',
        'The hash you provided is invalid.'
      )
      return
    }

    ipfs().get(text)
      .then((files) => {
        logger.info(`Hash ${text} downloaded.`)
        selectDirectory(opts)
          .then((dir) => {
            if (!dir) {
              logger.info(`Dropping hash ${text}: user didn't choose a path.`)
              return
            }

            if (files.length > 1) {
              fs.mkdirSync(path.join(dir, text))
            }

            files.forEach(file => { saveFile(opts, dir, file) })
          })
          .catch(e => logger.error(e.stack))
      })
      .catch(e => {
        logger.error(e.stack)
        dialog.showErrorBox(
          'Error while downloading',
          'Some error happened while getting the hash. Please check the logs.'
        )
      })
  }
}

export default function (opts) {
  let {logger, settingsStore} = opts

  let activate = (value, oldValue) => {
    if (value === oldValue) return

    if (value === true) {
      globalShortcut.register(shortcut, handler(opts))
      logger.info('Hash download shortcut enabled')
    } else {
      globalShortcut.unregister(shortcut)
      logger.info('Hash download shortcut disabled')
    }
  }

  activate(settingsStore.get(settingsOption))
  settingsStore.on(settingsOption, activate)
}
