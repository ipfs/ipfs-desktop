import createDaemon from './daemon'
import store from './store'
import logger from './logger'
import { notify, notifyError } from './notify'
import quitAndInstall from './quit-and-install'
import addToIpfs from './add-to-ipfs'

export {
  createDaemon,
  store,
  logger,
  notify,
  notifyError,
  quitAndInstall,
  addToIpfs
}
