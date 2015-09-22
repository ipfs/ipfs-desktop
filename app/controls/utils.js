import config from './../config'
import multiaddr from 'multiaddr'

export function apiAddrToUrl (apiAddr) {
  const parts = multiaddr(apiAddr).nodeAddress()

  return `http://${parts.address}:${parts.port}${config['webui-path']}`
}
