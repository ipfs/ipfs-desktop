import logger from './common/logger'
import cohost from 'ipfs-cohost'

// Cohosting is an experiment based on MFS. IPFS Desktop
// only needs to update the snapshots from time to time.
//
// Please see the spec and other discussion on
// https://github.com/ipfs-shipyard/cohosting

async function update (ctx) {
  const ipfsd = await ctx.getIpfsd()

  if (!ipfsd) {
    return
  }

  const ipfs = ipfsd.api

  try {
    cohost.sync(ipfs)
  } catch (err) {
    logger.error(`[cohosting] ${err.toString()}`)
  }
}

export default async function (ctx) {
  update(ctx)
  setInterval(() => { update(ctx) }, 43200000) // every 12 hours
}
