import path from 'path'
import cron from 'node-cron'
import fs from 'fs-extra'
import { recoverableErrorDialog } from './dialogs'
import store from './common/store'
import logger from './common/logger'

export const WEBSITES_FILE = path.join(path.dirname(store.path), 'cohost.txt')

export const cohostWebsites = async (ctx, fromScheduler = false) => {
  await fs.ensureFile(WEBSITES_FILE)
  const file = fs.readFileSync(WEBSITES_FILE).toString()
  const domains = file.split('\n')
    .map(f => f.trim())
    .filter(f => f !== '')

  if (domains.length === 0) {
    logger.info('[cohost] no websites found')
    return
  }

  const ipfsd = await ctx.getIpfsd(fromScheduler)
  if (!ipfsd) {
    return
  }

  const ipfs = ipfsd.api

  try {
    for (const domain of domains) {
      logger.info(`[cohost] pinning ${domain}`)
      const address = await ipfs.dns(domain)
      const cid = address.slice(6)
      await ipfs.pin.add(cid)
      logger.info(`[cohost] pinned ${domain} of cid: ${cid}`)
    }
  } catch (e) {
    logger.error(`[cohost] ${e.toString()}`)
    recoverableErrorDialog(e)
  }
}

export default async function (ctx) {
  cron.schedule('0 0 */12 * * *', () => {
    cohostWebsites(ctx, true)
  })

  cohostWebsites(ctx)
}
