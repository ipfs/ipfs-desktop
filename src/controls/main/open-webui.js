import {shell, ipcMain} from 'electron'
import {apiAddrToUrl} from '../utils'

function open (opts) {
  let {logger, ipfs} = opts

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
