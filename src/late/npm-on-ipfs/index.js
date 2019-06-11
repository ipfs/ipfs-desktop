import which from 'which'
import { ipcMain } from 'electron'
import { store, logger } from '../../utils'
import { createToggler } from '../utils'
import * as pkg from './package'

const SETTINGS_OPTION = 'experiments.npmOnIpfs'

export default function (ctx) {
  let interval = null

  createToggler(ctx, SETTINGS_OPTION, async (value, oldValue) => {
    if (value === oldValue) return

    if (value === true) {
      if (!await pkg.install()) return false
      interval = setInterval(existsAndUpdate, 43200000) // every 12 hours
      return true
    }

    clearInterval(interval)
    return pkg.uninstall()
  })

  let opt = store.get(SETTINGS_OPTION, null)
  const exists = !!which.sync('ipfs-npm', { nothrow: true })

  // Confirms if the package is still (un)installed because the user
  // might change it manually.
  if (opt !== null || exists !== false) {
    store.set(SETTINGS_OPTION, exists)
    opt = exists
  }

  if (opt === true) {
    interval = setInterval(existsAndUpdate, 43200000)
  }

  if (opt !== null) {
    logger.info('[npm on ipfs] no action taken')
    return
  }

  // First time running this function.
  if (!which.sync('npm', { nothrow: true })) {
    store.set(SETTINGS_OPTION, false)
  } else {
    ipcMain.emit('config.toggle', null, SETTINGS_OPTION)
  }
}

function existsAndUpdate () {
  if (which.sync('ipfs-npm', { nothrow: true })) {
    pkg.update()
  } else {
    store.set(SETTINGS_OPTION, false)
  }
}
