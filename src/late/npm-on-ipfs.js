import { dialog } from 'electron'
import { execFileSync } from 'child_process'
import { logger, store } from '../utils'

export default function (ctx) {
  run() // async hook
}

function has (bin, ...args) {
  try {
    execFileSync(bin, args)
    return true
  } catch (_) {
    return false
  }
}

function installNpmOnIpfs () {
  try {
    execFileSync('npm', [
      'install', '-g', 'ipfs-npm'
    ])

    logger.info('[npm on ipfs] ipfs-npm installed globally')
    return true
  } catch (e) {
    // TODO: tell the user
    logger.error('[npm on ipfs] %v', e)
    return false
  }
}

function replaceNpm () {
  // TODO. replace by script that adds the ipfs daemon
  console.log('replace npm')
}

function replaceYarn () {
  // TODO. replace by script that adds the ipfs daemon
  console.log('replace yarn')
}

async function run () {
  if (!has('node', '-v')) {
    return
  }

  let opts = store.get('npm', {
    asked: false,
    active: false
  })

  if (opts.active) {
    // TODO: check if out to date and update
    return
  }

  if (!opts.asked && !opts.active) {
    // TODO: ask the user if they want to install npm on ipfs tools
    // Explain that npm/yarn will be 'replaced' by 'ipfs-npm'

    const option = dialog.showMessageBox({
      title: 'Install NPM on IPFS?',
      message: 'message',
      buttons: [ 'No', 'Yes' ]
    })

    store.set('npm.asked', true)

    if (option === 0) {
      return
    }
  }

  await install()
}

async function install () {
  if (!installNpmOnIpfs()) {
    return
  }

  if (has('npm', '-v')) {
    replaceNpm()
  }

  if (has('yarn', '-v')) {
    replaceYarn()
  }

  store.set('npm.installed', true)
}
