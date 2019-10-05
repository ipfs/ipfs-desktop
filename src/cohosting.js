// Cohosting is an experiment based on MFS. IPFS Desktop
// only needs to update the snapshots from time to time.
//
// Please see the spec and other discussion on
// https://github.com/ipfs-shipyard/cohosting

function getTimestamp () {
  return new Date().toISOString()
    .replace(/:/g, '')
    .replace('T', '_')
    .split('.')[0]
}

async function update (ctx) {
  const ipfsd = await ctx.getIpfsd()

  if (!ipfsd) {
    return
  }

  const ipfs = ipfsd.api

  try {
    await ipfs.files.stat('/cohosting')
    const files = await ipfs.files.ls('/cohosting')
    const domains = files.map(file => file.name)

    for (const domain of domains) {
      const cid = await ipfs.resolve(`/ipns/${domain}`)
      const dirs = await ipfs.files.ls(`/cohosting/${domain}`)
      const latest = dirs.map(file => file.name).sort().pop()

      if (latest) {
        const path = `/cohosting/${domain}/${latest}`
        const stat = await ipfs.files.stat(path)

        if (`/ipfs/${stat.hash}` === cid) {
          await ipfs.files.mv([path, `/cohosting/${domain}/${getTimestamp()}`])
          continue
        }
      }

      await ipfs.files.cp([cid, `/cohosting/${domain}/${getTimestamp()}`])
    }
  } catch (_) {
    // Probably there's no /cohosting, ignoring
  }
}

export default async function (ctx) {
  update(ctx)
  setInterval(() => { update(ctx) }, 43200000) // every 12 hours
}
