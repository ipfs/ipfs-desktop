import multiaddr from 'multiaddr'
import isIPFS from 'is-ipfs'

export function apiAddrToUrl (apiAddr) {
  const parts = multiaddr(apiAddr).nodeAddress()
  const address = parts.address === '127.0.0.1' ? 'localhost' : parts.address

  return `http://${address}:${parts.port}/webui`
}

export function validateIPFS (text) {
  return isIPFS.multihash(text) ||
    isIPFS.cid(text) ||
    isIPFS.ipfsPath(text) ||
    isIPFS.ipfsPath(`/ipfs/${text}`)
}
