import {shell, ipcMain} from 'electron'
import {apiAddrToUrl} from '../utils'
import { logger } from '../../utils'

function open (opts) {
  let { ipfs } = opts

  return async () => {
    try {
      const res = await ipfs().config.get('Addresses.API')
      shell.openExternal(apiAddrToUrl(res))
    } catch (e) {
      logger.error(e.stack)
    }
  }
}

export default function (opts) {
  ipcMain.on('open-webui', open(opts))
}
