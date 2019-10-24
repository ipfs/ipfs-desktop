import AutoLaunch from 'auto-launch'
import { app } from 'electron'
import os from 'os'
import path from 'path'
import fs from 'fs-extra'
import untildify from 'untildify'
import createToggler from './create-toggler'
import logger from './common/logger'
import store from './common/store'
import { IS_MAC, IS_WIN } from './common/consts'

const CONFIG_KEY = 'autoLaunch'

function isSupported () {
  const plat = os.platform()
  return plat === 'linux' || plat === 'win32' || plat === 'darwin'
}

// Disable the old auto launch mechanism.
// TODO: remove on 0.10.0.
async function disableOldLogin () {
  try {
    const autoLauncher = new AutoLaunch({ name: 'IPFS Desktop' })

    if (await autoLauncher.isEnabled()) {
      await autoLauncher.disable()
      logger.error('[launch on startup] old mechanism disabled')
    }
  } catch (_) {
    // ignore...
  }
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

export default async function (ctx) {
  await disableOldLogin()

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
