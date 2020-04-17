const { app, shell } = require('electron')
const toUri = require('multiaddr-to-uri')

function openLink (protocol, part, base) {
  shell.openExternal(`${base}/${protocol}/${part}`)
  return true
}

function parseAddr (addr) {
  return toUri(addr.toString().includes('/http') ? addr : addr.encapsulate('/http'))
}

async function parseUrl (url, ctx) {
  const ipfsd = ctx.getIpfsd ? await ctx.getIpfsd(true) : null
  let base = 'https://ipfs.io'

  if (ipfsd && ipfsd.gatewayAddr) {
    base = parseAddr(ipfsd.gatewayAddr)
  }

  if (url.startsWith('ipfs://')) {
    return openLink('ipfs', url.slice(7), base)
  } else if (url.startsWith('ipns://')) {
    return openLink('ipns', url.slice(7), base)
  } else if (url.startsWith('dweb:/ipfs/')) {
    return openLink('ipfs', url.slice(11), base)
  } else if (url.startsWith('dweb:/ipns/')) {
    return openLink('ipns', url.slice(11), base)
  }

  return false
}

async function argvHandler (argv, ctx) {
  let handled = false

  for (const arg of argv) {
    if (await parseUrl(arg, ctx)) {
      handled = true
    }
  }

  return handled
}

module.exports = function (ctx) {
  // Handle if the app started running now, and a link
  // was sent to be handled.
  argvHandler(process.argv, ctx)

  // Handle URLs in macOS
  app.on('open-url', (event, url) => {
    event.preventDefault()
    parseUrl(url, ctx)
  })
}

module.exports.argvHandler = argvHandler
