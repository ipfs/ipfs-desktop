import multiaddr from 'multiaddr'
import config from './../config'

export function apiAddrToUrl (apiAddr) {
  const parts = multiaddr(apiAddr).nodeAddress()

  return `http://${parts.address}:${parts.port}${config['webui-path']}`
}
