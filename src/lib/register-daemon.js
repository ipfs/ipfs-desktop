import { store, createDaemon, logger } from '../utils'
import { app } from 'electron'

export default async function (ctx) {
  let config = store.get('ipfsConfig')
  let ipfsd = null

  ctx.getIpfsd = () => ipfsd

  ctx.startIpfs = async () => {
    ipfsd = await createDaemon(config)

    // Update the path if it was blank previously.
    // This way we use the default path when it is
    // not set.
    if (config.path === '') {
      config.path = ipfsd.repoPath
      store.set('ipfsConfig', config)
    }
  }

  ctx.stopIpfs = async () => {
    return new Promise((resolve, reject) => {
      ipfsd.stop(err => {
        if (err) {
          return reject(err)
        }

        ipfsd = null
        resolve()
      })
    })
  }

  await ctx.startIpfs()

  app.once('will-quit', async (event) => {
    event.preventDefault()
    logger.info('Stopping daemon')
    await ctx.stopIpfs()
    logger.info('Done. Quitting app')
    app.quit()
  })
}
