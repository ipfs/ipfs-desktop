import { app, ipcMain } from 'electron'
import { store, logger, createDaemon } from '../utils'
import { join } from 'path'

const settingsOption = 'ipfsBackend'
const isJavascript = (implementation) => {
  return implementation === 'js'
}

async function setupConnection () {
  let config = store.get('config')

  if (config === null) {
    config = {
      type: 'go',
      path: join(app.getPath('home'), '.ipfs')
    }
  }

  if (config.type === 'go') {
    config = {
      type: 'go',
      path: join(app.getPath('home'), '.ipfs')
    }
  }

  if (config.type === 'js') {
    config = {
      type: 'js',
      path: join(app.getPath('home'), '.ipfs')
    }
  }

  store.set('config', config)

  return createDaemon(config)
}

const doToggle = (value) => {
  if (value === null) {
    logger.info('Initialized with go-ipfs daemon. Visit Settings to enable js-ipfs.')
    return 'go'
  }

  if (value === 'js') {
    logger.info('value in go switch ' + value)
    logger.info('Go IPFS implementation enabled.')
    return 'go'
  }

  if (value === 'go') {
    logger.info('value in js switch ' + value)
    logger.info('Javascript IPFS implementation enabled.')
    return 'js'
  }
}

export default function (ctx) {
  ipcMain.on('config.toggle', async (_, opt) => {
    let currentSetting = ctx.ipfsd.opts.type

    if (opt === settingsOption) {
      let implementation = doToggle(currentSetting)
      let path = join(app.getPath('home'), isJavascript(implementation) ? '.ipfs' : '.ipfs')
      store.set('config.type', implementation)
      store.set('config.path', path)
      let config = store.get('config')
      logger.info('store.config.path ' + config)
      // ctx.ipfsd.stop()
      ctx.ipfsd = await setupConnection().catch(err => logger.info('err ' + err.stack))
      ctx.webUiWindow.webContents.send('config.changed', store.store)
    }
  })
}
