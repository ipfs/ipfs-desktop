import {shell, ipcMain} from 'electron'
import {apiAddrToUrl} from '../utils'
import { logger } from '../../utils'

function open (opts) {
  let { ipfs } = opts

  return () => {
    ipfs().config.get('Addresses.API')
      .then((res) => {
        shell.openExternal(apiAddrToUrl(res))
      })
      .catch(e => { logger.error(e.stack) })
  }
}

export default function (opts) {
  ipcMain.on('open-webui', open(opts))
}
