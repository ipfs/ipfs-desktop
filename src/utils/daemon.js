import IPFSFactory from 'ipfsd-ctl'

export default async function createDaemon (opts) {
  opts.type = opts.type || 'go'
  opts.path = opts.path || ''
  opts.flags = opts.flags || ['--migrate=true', '--routing=dhtclient']
  opts.keysize = opts.keysize || 4096

  if (opts.type !== 'go') {
    throw new Error(`${opts.type} connection is not supported yet`)
  }

  const factory = IPFSFactory.create({ type: opts.type })

  const ipfsd = await new Promise((resolve, reject) => {
    factory.spawn({
      disposable: false,
      defaultAddrs: true,
      repoPath: opts.path
    }, (e, ipfsd) => {
      if (e) return reject(e)
      if (ipfsd.initialized) {
        return resolve(ipfsd)
      }

      ipfsd.init({
        directory: opts.path,
        keysize: opts.keysize
      }, e => {
        if (e) return reject(e)
        resolve(ipfsd)
      })
    })
  })

  if (!ipfsd.started) {
    await new Promise((resolve, reject) => {
      ipfsd.start(opts.flags, err => {
        if (err) {
          return reject(err)
        }

        resolve()
      })
    })
  }

  let origins = await ipfsd.api.config.get('API.HTTPHeaders.Access-Control-Allow-Origin') || []
  if (!origins.includes('webui://-')) origins.push('webui://-')
  if (!origins.includes('https://webui.ipfs.io')) origins.push('https://webui.ipfs.io')

  await ipfsd.api.config.set('API.HTTPHeaders.Access-Control-Allow-Origin', origins)
  await ipfsd.api.config.set('API.HTTPHeaders.Access-Control-Allow-Method', ['PUT', 'GET', 'POST'])

  return ipfsd
}
