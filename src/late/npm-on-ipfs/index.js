import { dialog } from 'electron'
import i18n from 'i18next'
import { hasBin } from '../utils'
import { store } from '../../utils'
import { install, update } from './install'

export default function (ctx) {
  run() // async hook
  // TODO: createToggler
}

async function run () {
  if (!hasBin('node', '-v')) {
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
