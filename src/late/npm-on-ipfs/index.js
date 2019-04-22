import { dialog } from 'electron'
import i18n from 'i18next'
import which from 'which'
import { store } from '../../utils'
import { createToggler } from '../utils'
import { install, update, uninstall } from './lib'

export default function (ctx) {
  run()

  const activate = (value, oldValue) => {
    if (value === oldValue) return
    if (value === true) return install()
    return uninstall()
  }

  createToggler(ctx, 'npmOnIpfs', activate)
}

async function run () {
  if (!which.sync('node', { nothrow: true })) {
    return
  }

  let opts = store.get('npm', {
    asked: false,
    active: false
  })

  if (opts.active) {
    update()
    setInterval(update, 43200000) // every 12 hours
    return
  }

  if (!opts.asked && !opts.active) {
    // TODO: ask the user if they want to install npm on ipfs tools
    // Explain that npm/yarn will be 'replaced' by 'ipfs-npm'

    const option = dialog.showMessageBox({
      title: i18n.t('npmOnIpfs'),
      message: i18n.t('npmOnIpfsMessage'),
      buttons: [ i18n.t('no'), i18n.t('yes') ]
    })

    store.set('npm.asked', true)

    if (option === 0) {
      return
    }
  }

  await install()
}
