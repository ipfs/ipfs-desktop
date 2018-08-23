import {ipcMain} from 'electron'
import { logger } from '../../utils'

function gc (opts) {
  let {ipfs} = opts

  return () => {
    ipfs().repo.gc()
      .then(() => { logger.info('Garbage collector run sucessfully') })
      .catch(e => { logger.error(e.stack) })
  }
}

export default function (opts) {
  ipcMain.on('run-gc', gc(opts))
}
