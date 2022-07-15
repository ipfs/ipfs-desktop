const toUri = require('multiaddr-to-uri')
const { CID } = require('multiformats/cid')
const fetch = require('node-fetch')

const DEFAULT_GATEWAY = 'https://dweb.link'
const LOCAL_HOSTNAMES = ['127.0.0.1', '[::1]', '0.0.0.0', '[::]']

/**
 * @typedef ParsedUrl
 * @type {object}
 * @property {string} protocol
 * @property {string} hostname
 * @property {string} path
 */

/**
 * Parses an IPFS/IPNS/dWeb URL to be handled by IPFS Desktop.
 *
 * @param {string} url
 * @returns {ParsedUrl|null}
 */
function parseUrl (url) {
  let protocol = null
  let hostname = null
  let path = '/'

  if (url.startsWith('ipfs://')) {
    protocol = 'ipfs'
    hostname = url.slice(7)
  } else if (url.startsWith('ipns://')) {
    protocol = 'ipns'
    hostname = url.slice(7)
  } else if (url.startsWith('dweb:/ipfs/')) {
    protocol = 'ipfs'
    hostname = url.slice(11)
  } else if (url.startsWith('dweb:/ipns/')) {
    protocol = 'ipns'
    hostname = url.slice(11)
  } else {
    return null
  }

  if (hostname.includes('/')) {
    const [first, ...rest] = hostname.split('/')
    hostname = first
    path = '/' + rest.join('/')
  }

  return { protocol, hostname, path }
}

async function getPublicGatewayUrl (ctx) {
  if (!ctx.webui) {
    // Best effort. If the Web UI window wasn't created yet, we just return the default
    // gateway.
    return DEFAULT_GATEWAY
  }

  return await ctx.webui
    .webContents
    .executeJavaScript('JSON.parse(localStorage.getItem("ipfsPublicGateway")) || "https://dweb.link"', true)
}

async function getPrivateGatewayUrl (ctx) {
  const ipfsd = ctx.getIpfsd ? await ctx.getIpfsd(true) : null
  if (!ipfsd || !ipfsd.api) {
    return DEFAULT_GATEWAY
  }

  let gateway = await ipfsd.api.config.get('Addresses.Gateway')
  if (Array.isArray(gateway)) {
    if (gateway.length >= 1) {
      gateway = gateway[0]
    } else {
      return DEFAULT_GATEWAY
    }
  }

  return toUri(gateway)
}

const checkIfGatewayUrlIsAccessible = async (url) => {
  try {
    const { status } = await fetch(
    `${url}/ipfs/bafkqae2xmvwgg33nmuqhi3zajfiemuzahiwss`
    )
    return status === 200
  } catch (e) {
    return false
  }
}

// Separate test is necessary to see if subdomain mode is possible,
// because some browser+OS combinations won't resolve them:
// https://github.com/ipfs/go-ipfs/issues/7527
const checkIfSubdomainGatewayUrlIsAccessible = async (url) => {
  try {
    url = new URL(url)
    url.hostname = `bafkqae2xmvwgg33nmuqhi3zajfiemuzahiwss.ipfs.${url.hostname}`
    const { status } = await fetch(url.toString())
    return status === 200
  } catch (e) {
    return false
  }
}

/**
 * Get the gateway URL. Logic borrowed from Web UI.
 * Please check https://github.com/ipfs/ipfs-webui/pull/1591.
 *
 * @param {object} ctx
 * @param {ParsedUrl} parsedUrl
 * @returns
 */
async function getGatewayUrl (ctx, { protocol, hostname, path }) {
  const publicGateway = await getPublicGatewayUrl(ctx)
  const privateGateway = await getPrivateGatewayUrl(ctx)

  const gw = new URL(privateGateway)
  if (LOCAL_HOSTNAMES.includes(gw.hostname)) {
    gw.hostname = 'localhost'
    const localUrl = gw.toString().replace(/\/+$/, '') // no trailing slashes
    if (await checkIfSubdomainGatewayUrlIsAccessible(localUrl)) {
      if (protocol === 'ipns') {
        hostname = hostname.replaceAll('.', '-')
        gw.hostname = `${hostname}.ipns.localhost`
      } else {
        const cid = CID.parse(hostname)
        gw.hostname = `${cid.toV1().toString()}.ipfs.localhost`
      }

      gw.pathname = path
      return gw.toString().replace(/\/+$/, '')
    }
  }

  if (await checkIfGatewayUrlIsAccessible(privateGateway)) {
    return `${privateGateway}/${protocol}/${hostname}${path}`
  }

  return `${publicGateway}/${protocol}/${hostname}${path}`
}

module.exports = {
  parseUrl,
  getGatewayUrl
}
