import {ipcMain} from 'electron'

function gc (opts) {
  let {debug, ipfs} = opts

  return () => {
    ipfs().repo.gc()
      .then(() => { debug('Garbage collector run sucessfully') })
      .catch(e => { debug(e.stack) })
  }
}

export default function (opts) {
  ipcMain.on('run-gc', gc(opts))
}
