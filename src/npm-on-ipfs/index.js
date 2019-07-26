import which from 'which'
import { ipcMain } from 'electron'
import * as pkg from './package'
import logger from '../common/logger'
import store from '../common/store'
import createToggler from '../create-toggler'

const CONFIG_KEY = 'experiments.npmOnIpfs'

export default function (ctx) {
  let interval = null

  createToggler(ctx, CONFIG_KEY, async (value, oldValue) => {
    if (value === oldValue) return

    // If the user is telling to (un)install even though they have (un)installed
    // ipfs-npm package manually.
    const manual = isPkgInstalled() === value

    if (value === true) {
      if (!manual && !await pkg.install()) return false
      interval = setInterval(existsAndUpdate, 43200000) // every 12 hours
      return true
    }

    clearInterval(interval)
    return manual || pkg.uninstall()
  })

  let opt = store.get(CONFIG_KEY, null)
  const exists = isPkgInstalled()

  // Confirms if the package is still (un)installed because the user
  // might change it manually.
  if (opt !== null || exists !== false) {
    store.set(CONFIG_KEY, exists)
    opt = exists
  }

  if (opt === true) {
    interval = setInterval(existsAndUpdate, 43200000) // every 12 hours
  }

  if (opt !== null) {
    logger.info('[npm on ipfs] no action taken')
    return
  }

  // First time running this function.
  if (!which.sync('npm', { nothrow: true })) {
    store.set(CONFIG_KEY, false)
  } else {
    ipcMain.emit('config.toggle', null, CONFIG_KEY)
  }
}

function isPkgInstalled () {
  return !!which.sync('ipfs-npm', { nothrow: true })
}

function existsAndUpdate () {
  if (isPkgInstalled()) {
    pkg.update()
  } else {
    store.set(CONFIG_KEY, false)
  }
}
