import { app, ipcMain } from 'electron'
import { store, logger, createDaemon } from '../utils'
import { join } from 'path'

const settingsOption = 'ipfsBackend'
const isJavascript = (implementation) => {
  return implementation === 'js'
}


const doToggle = (value) => {
  if(value === null){
    logger.info('Initialized with go-ipfs daemon. Visit Settings to enable js-ipfs.')
    return 'go'
  }

  if (value === 'js') {
    logger.info('value in go switch ' + value)
    logger.info('Go IPFS implementation enabled.')
    return 'go'
  }

  if (value == 'go'  ) {
    logger.info('value in js switch ' + value)
    logger.info('Javascript IPFS implementation enabled.')
    return 'js'
  }
}


export default function (ctx) {
  ipcMain.on('config.toggle', async (_, opt) => {
    let currentSetting = ctx.ipfsd.opts.type

    if (opt === settingsOption) {
      logger.info('ipfsBackend> ' + store.get(settingsOption))
      let implementation = doToggle(currentSetting)
      let path = join(app.getPath('home'), isJavascript(implementation) ? './.jsipfs' : './.ipfs' )
      let config = {type: implementation, path: path}
      logger.info('imp> '+ implementation + 'path: ' + path)
      store.set(config['type'], implementation)
      logger.info('ipfsBackend after store.set> ' + store.get(settingsOption))
      logger.info('config after store.set> ' + Object.keys(config) + ' type: '+config.type)
      ctx.ipfsd.stop()
      ctx.ipfsd = await createDaemon(config).catch(err => logger.info('err ' + err.stack))
      ctx.webUiWindow.webContents.send('config.changed', store.store)
    }
  })
}
