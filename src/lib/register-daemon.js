import { store, createDaemon, logger } from '../utils'
import { app } from 'electron'

export default async function (ctx) {
  let config = store.get('ipfsConfig')
  ctx.ipfsd = await createDaemon(config)

  // Update the path if it was blank previously.
  // This way we use the default path when it is
  // not set.
  if (config.path === '') {
    config.path = ctx.ipfsd.repoPath
    store.set('ipfsConfig', config)
  }

  app.once('will-quit', async (event) => {
    event.preventDefault()
    logger.info('Stopping daemon')

    await new Promise((resolve, reject) => {
      ctx.ipfsd.stop(err => {
        if (err) reject(err)
        else resolve()
      })
    })

    logger.info('Done. Quitting app')
    app.quit()
  })
}
