import {shell, ipcMain} from 'electron'
import {apiAddrToUrl} from '../utils'

function open (opts) {
  let {debug, ipfs} = opts

  return () => {
    ipfs().config.get('Addresses.API')
      .then((res) => {
        shell.openExternal(apiAddrToUrl(res))
      })
      .catch(e => { debug(e.stack) })
  }
}

export default function (opts) {
  ipcMain.on('open-webui', open(opts))
}
