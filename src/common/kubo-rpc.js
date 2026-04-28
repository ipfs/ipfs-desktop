const http = require('http')

// TODO: drop this raw HTTP helper once the project switches to
// kubo-rpc-client. The client exposes config.get / config.set / files.chcid
// and handles auth headers, query encoding, and IPv6 for us.
function kuboApiPost (ipfsd, apiPath) {
  return new Promise((resolve, reject) => {
    const { address, port } = ipfsd.apiAddr.nodeAddress()

    const req = http.request({
      method: 'POST',
      hostname: address,
      port,
      path: apiPath,
      timeout: 30000
    }, (res) => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data)
        } else {
          reject(new Error(`kubo API ${apiPath} returned status ${res.statusCode}: ${data}`))
        }
      })
    })

    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error(`kubo API ${apiPath} request timed out`))
    })
    req.end()
  })
}

module.exports = { kuboApiPost }
