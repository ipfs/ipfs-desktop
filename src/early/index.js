import protocolHandlers from './protocol-handlers'
import ipfsScript from './ipfs-script'

// Functions that must run on app 'will-finish-launching'.
export default function (ctx) {
  protocolHandlers(ctx)
  ipfsScript(ctx)
}
