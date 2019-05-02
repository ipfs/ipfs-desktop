import i18n from 'i18next'
import which from 'which'
import { join } from 'path'
import { ipcMain } from 'electron'
import { store, logger, execOrSudo } from '../../utils'
import { createToggler } from '../utils'
import { showDialog } from '../../dialogs'
import pkg from './package'

const SETTINGS_OPTION = 'npmOnIpfs'

export default function (ctx) {
  createToggler(ctx, 'npmOnIpfs', (value, oldValue) => {
    if (value === oldValue) return
    if (value === true) return run('install')
    return run('uninstall')
  })

  runner()
}

function runner () {
  const setting = store.get(SETTINGS_OPTION, null)

  // Check if we've done this before.
  if (setting !== null) {
    if (setting) {
      pkg.update()
      setInterval(pkg.update, 43200000) // every 12 hours
    }

    logger.info('[npm on ipfs] no action taken')
    return
  }

  if (!which.sync('node', { nothrow: true })) {
    return
  }

  // TODO: ask the user if they want to install npm on ipfs tools
  // Explain that npm/yarn will be 'replaced' by 'ipfs-npm'
  const option = showDialog({
    type: 'info',
    title: i18n.t('npmOnIpfs.title'),
    message: i18n.t('npmOnIpfs.message'),
    buttons: [
      i18n.t('yes'),
      i18n.t('no')
    ]
  })

  if (option === 0) {
    // Trigger the toggler.
    ipcMain.emit('config.toggle', null, SETTINGS_OPTION)
  } else {
    store.set(SETTINGS_OPTION, false)
  }
}

async function run (script) {
  if (script === 'install' && !pkg.install()) {
    return false
  }

  const path = join(__dirname, `./scripts/${script}.js`)
  return execOrSudo(path, 'npm on ipfs')
}
