import {shell, ipcMain} from 'electron'
import {apiAddrToUrl} from '../utils'

function open (opts) {
  let {logger, ipfs} = opts

  return () => {
    ipfs().config.get('Addresses.API')
      .then((res) => {
        shell.openExternal(apiAddrToUrl(res))
      })
      .catch(logger.error)
  }
}

export default function (opts) {
  ipcMain.on('open-webui', open(opts))
}
