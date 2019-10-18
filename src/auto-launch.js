import AutoLaunch from 'auto-launch'
import { app } from 'electron'
import os from 'os'
import path from 'path'
import fs from 'fs-extra'
import untildify from 'untildify'
import createToggler from './create-toggler'
import logger from './common/logger'
import store from './common/store'

const CONFIG_KEY = 'autoLaunch'

function isSupported () {
  const plat = os.platform()
  return plat === 'linux' || plat === 'win32' || plat === 'darwin'
}

function getDesktopFile () {
  return path.join(untildify('~/.config/autostart/'), 'ipfs-desktop.desktop')
}

const autoLauncher = new AutoLaunch({
  name: 'IPFS Desktop'
})

async function enable () {
  if (app.setLoginItemSettings) {
    app.setLoginItemSettings({ openAtLogin: true })
  }

  const desktop = `[Desktop Entry]
Type=Application
Version=1.0
Name="IPFS Desktop"
Comment="IPFS Desktop Startup Script"
Exec="${process.execPath}"
StartupNotify=false
Terminal=false`

  await fs.outputFile(getDesktopFile(), desktop)
}

async function disable () {
  if (app.setLoginItemSettings) {
    app.setLoginItemSettings({ openAtLogin: false })
  }

  await fs.remove(getDesktopFile())
}

export default async function (ctx) {
  // Disable the old auto launch mechanism.
  // TODO: remove on 0.10.0.
  if (await autoLauncher.isEnabled()) await autoLauncher.disable()

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
