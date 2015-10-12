import geoip from 'ipfs-geoip'

function isLocal (address) {
  var split = address.split('.')
  if (split[0] === '10') return true
  if (split[0] === '127') return true
  if (split[0] === '192' && split[1] === '168') return true
  if (split[0] === '172' && +split[1] >= 16 && +split[1] <= 31) return true
  return false
}

export function getLocation (ipfs, multiaddrs, cb) {
  if (multiaddrs.length === 0) return cb(null, null)
  var address = multiaddrs[0].split('/')[2]
  if (isLocal(address)) return getLocation(ipfs, multiaddrs.slice(1), cb)

  geoip.lookup(ipfs, address, function (err, res) {
    if (err) {
      throw err
    }

    if (!res.country_name && multiaddrs.length > 1) {
      return getLocation(ipfs, multiaddrs.slice(1), cb)
    }

    var location = 'Earth'
    if (res.country_name) location = res.country_name + ', ' + location
    if (res.region_code) location = res.region_code + ', ' + location
    if (res.city) location = res.city + ', ' + location

    res.formatted = location
    cb(null, res)
  })
}
