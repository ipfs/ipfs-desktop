import protocolHandlers from './protocol-handlers'

// Functions that must run on app 'will-finish-launching'.
export default function (ctx) {
  protocolHandlers(ctx)
}
