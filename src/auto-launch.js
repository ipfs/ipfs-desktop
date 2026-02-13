// @ts-check
const { app } = require('electron')
const i18n = require('i18next')
const os = require('node:os')
const path = require('node:path')
const fs = require('fs-extra')
const createToggler = require('./utils/create-toggler')
const logger = require('./common/logger')
const store = require('./common/store')
const { IS_MAC, IS_WIN } = require('./common/consts')
const { AUTO_LAUNCH: CONFIG_KEY } = require('./common/config-keys')
const { showDialog, recoverableErrorDialog } = require('./dialogs')

function isSupported () {
  const plat = os.platform()
  return plat === 'linux' || plat === 'win32' || plat === 'darwin'
}

function getDesktopFile () {
  return path.join(os.homedir(), '.config/autostart/', 'ipfs-desktop.desktop')
}

function quoteDesktopEntryArg (value) {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

function getLinuxAutostartExec () {
  const command = [process.execPath]

  // Some distro packages launch as `electron <app.asar>`.
  if (path.basename(process.execPath).startsWith('electron')) {
    const appPath = app.getAppPath()

    if (appPath && appPath !== process.execPath) {
      command.push(appPath)
    }
  }

  return command.map(quoteDesktopEntryArg).join(' ')
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
Exec=${getLinuxAutostartExec()}
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

module.exports = async function () {
  const activate = async ({ newValue, oldValue, feedback }) => {
    if (process.env.NODE_ENV === 'development') {
      logger.info('[launch on startup] unavailable during development')

      if (feedback) {
        showDialog({
          title: 'Launch at Login',
          message: 'Not available during development.',
          buttons: [i18n.t('close')]
        })
      }

      return
    }

    if (!isSupported()) {
      logger.info('[launch on startup] not supported on this platform')

      if (feedback) {
        showDialog({
          title: i18n.t('launchAtLoginNotSupported.title'),
          message: i18n.t('launchAtLoginNotSupported.message'),
          buttons: [i18n.t('close')]
        })
      }

      return false
    }

    if (newValue === oldValue) return

    try {
      if (newValue === true) {
        await enable()
        logger.info('[launch on startup] enabled')
      } else {
        await disable()
        logger.info('[launch on startup] disabled')
      }

      return true
    } catch (err) {
      logger.error(`[launch on startup] ${err.toString()}`)

      if (feedback) {
        recoverableErrorDialog(err, {
          title: i18n.t('launchAtLoginFailed.title'),
          message: i18n.t('launchAtLoginFailed.message')
        })
      }

      return false
    }
  }

  activate({ newValue: store.get(CONFIG_KEY, false) })
  createToggler(CONFIG_KEY, activate)
}

module.exports.isSupported = isSupported
