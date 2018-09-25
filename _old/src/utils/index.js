import path from 'path'
import os from 'os'
import store from './store'
import logger from './logger'
import getIpfs from './ipfs'

export function logo (color) {
  const p = path.resolve(path.join(__dirname, '../img'))

  if (os.platform() === 'darwin') {
    return path.join(p, `icons/${color}.png`)
  }

  return path.join(p, `ipfs-logo-${color}.png`)
}

export {store, logger, getIpfs}
