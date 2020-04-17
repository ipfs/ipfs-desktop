const { app } = require('electron')
const os = require('os')
const path = require('path')
const fs = require('fs-extra')
const untildify = require('untildify')
const createToggler = require('./create-toggler')
const logger = require('./common/logger')
const store = require('./common/store')
const { IS_MAC, IS_WIN } = require('./common/consts')

const CONFIG_KEY = 'autoLaunch'

function isSupported () {
  const plat = os.platform()
  return plat === 'linux' || plat === 'win32' || plat === 'darwin'
}

function getDesktopFile () {
  return path.join(untildify('~/.config/autostart/'), 'ipfs-desktop.desktop')
}

async function enable () {
  if (app.setLoginItemSettings && (IS_MAC || IS_WIN)) {
    app.setLoginItemSettings({ openAtLogin: true })
    return
  }

  const desktop = `[Desktop Entry]
Type=Application
Version=1.0
Name=IPFS Desktop
Comment=IPFS Desktop Startup Script
Exec="${process.execPath}"
Icon=ipfs-desktop
StartupNotify=false
Terminal=false`

  await fs.outputFile(getDesktopFile(), desktop)
}

async function disable () {
  if (app.setLoginItemSettings && (IS_MAC || IS_WIN)) {
    app.setLoginItemSettings({ openAtLogin: false })
    return
  }

  await fs.remove(getDesktopFile())
}

module.exports = async function (ctx) {
  const activate = async (value, oldValue) => {
    if (process.env.NODE_ENV === 'development') {
      logger.info('[launch on startup] unavailable during development')
      return
    }

    if (!isSupported()) {
      logger.info('[launch on startup] not supported on this platform')
      return false
    }

    if (value === oldValue) return

    try {
      if (value === true) {
        await enable()
        logger.info('[launch on startup] enabled')
      } else {
        await disable()
        logger.info('[launch on startup] disabled')
      }

      return true
    } catch (err) {
      logger.error(`[launch on startup] ${err.toString()}`)
      return false
    }
  }

  activate(store.get(CONFIG_KEY, false))
  createToggler(ctx, CONFIG_KEY, activate)
}
