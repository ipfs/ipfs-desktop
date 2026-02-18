const { app, shell } = require('electron')
const getCtx = require('./context')
const { getModules } = require('./esm-loader')

function openLink (protocol, part, base) {
  shell.openExternal(`${base}/${protocol}/${part}`)
  return true
}

function parseAddr (addr) {
  const { multiaddrToUri, multiaddr } = getModules()
  const ma = typeof addr === 'string' ? multiaddr(addr) : addr
  const withHttp = ma.toString().includes('/http') ? ma : ma.encapsulate('/http')
  return multiaddrToUri(withHttp)
}

async function handleOpenLink (url) {
  const getIpfsd = await getCtx().getProp('getIpfsd')
  const ipfsd = getIpfsd ? await getIpfsd(true) : null
  let base = 'https://dweb.link'

  if (ipfsd) {
    try {
      const info = await ipfsd.info()
      if (info.gateway) {
        base = parseAddr(info.gateway)
      }
    } catch (e) {
      // fallback to default gateway
    }
  }

  if (url.startsWith('ipfs://')) {
    return openLink('ipfs', url.slice(7), base)
  } else if (url.startsWith('ipns://')) {
    return openLink('ipns', url.slice(7), base)
  }

  return false
}

async function argvHandler (argv) {
  let handled = false

  for (const arg of argv) {
    if (await handleOpenLink(arg)) {
      handled = true
    }
  }

  return handled
}

module.exports = function () {
  // Handle if the app started running now, and a link
  // was sent to be handled.
  argvHandler(process.argv)

  // Handle URLs in macOS
  app.on('open-url', async (event, url) => {
    event.preventDefault()
    handleOpenLink(url)
  })
}

module.exports.argvHandler = argvHandler
