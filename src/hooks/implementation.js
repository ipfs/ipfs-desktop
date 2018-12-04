import { app, ipcMain } from 'electron'
import { store, logger, createDaemon } from '../utils'
import { join } from 'path'
import { createToggler } from './utils'


const config = store.get('config')


const settingsOption = 'type'
const isJavascript = (implementation) => {
  return implementation === 'js'
}

const shutdownOldNode = async (ctx) => {
  logger.info(`Shutting down ${ctx.ipfsd.opts.type} backend.`)
    await ctx.ipfsd.stop()
}


export default async function (ctx) {
  let activate = async (value, oldValue) => {
    if (value === oldValue) return

    if (value === true) {
      store.set('type', 'js')
      await shutdownOldNode(ctx)
      ctx.ipfsd = await createDaemon(config)
      logger.info('Javascript implementation enabled')
    } else {
      store.set('type', 'go')
      await shutdownOldNode(ctx)
      ctx.ipfsd = await createDaemon(config)
      logger.info('Javascript implementation disabled')
    }
  }
  await activate(store.get(settingsOption, false))
  createToggler(ctx, settingsOption, activate)
}
