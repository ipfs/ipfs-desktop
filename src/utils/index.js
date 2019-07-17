import { IS_MAC, IS_WIN } from './consts'
import createDaemon from './daemon'
import store from './store'
import logger from './logger'
import { notify, notifyError } from './notify'
import quitAndInstall from './quit-and-install'
import addToIpfs from './add-to-ipfs'
import execOrSudo from './exec-or-sudo'
import createToggler from './create-toggler'
import setupGlobalShortcut from './setup-global-shortcut'

export {
  createDaemon,
  store,
  logger,
  notify,
  notifyError,
  quitAndInstall,
  execOrSudo,
  addToIpfs,
  createToggler,
  setupGlobalShortcut,
  IS_MAC,
  IS_WIN
}
