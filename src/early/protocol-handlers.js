import { app, shell } from 'electron'
import toUri from 'multiaddr-to-uri'

function openLink (protocol, part, base) {
  shell.openExternal(`${base}/${protocol}/${part}`)
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
    openLink('ipfs', url.slice(7), base)
  } else if (url.startsWith('ipns://')) {
    openLink('ipns', url.slice(7), base)
  } else if (url.startsWith('dweb:/ipfs/')) {
    openLink('ipfs', url.slice(11), base)
  } else if (url.startsWith('dweb:/ipns/')) {
    openLink('ipns', url.slice(11), base)
  }
}

export default function (ctx) {
  // Handle if the app started running now, and a link
  // was sent to be handled.
  for (const arg of process.argv) {
    parseUrl(arg, ctx)
  }

  // Handle URLs in macOS
  app.on('open-url', (event, url) => {
    event.preventDefault()
    parseUrl(url, ctx)
  })

  // Handle URLs on Windows (hopefully on Linux too)
  app.on('second-instance', (_, argv) => {
    for (const arg of argv) {
      parseUrl(arg, ctx)
    }
  })
}
