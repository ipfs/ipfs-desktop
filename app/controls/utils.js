import multiaddr from 'multiaddr'
import config from './../config'

export function apiAddrToUrl (apiAddr) {
  const parts = multiaddr(apiAddr).nodeAddress()
  const address = parts.address === '127.0.0.1' ? 'localhost' : parts.address

  return `http://${address}:${parts.port}${config['webui-path']}`
}
