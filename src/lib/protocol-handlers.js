import { app, shell } from 'electron'

function openLink (protocol, part) {
  shell.openExternal(`https://ipfs.io/${protocol}/${part}`)
}

function parseUrl (url) {
  if (url.startsWith('ipfs://')) {
    openLink('ipfs', url.slice(7))
  } else if (url.startsWith('ipns://')) {
    openLink('ipns', url.slice(7))
  } else if (url.startsWith('dweb:/ipfs/')) {
    openLink('ipfs', url.slice(11))
  } else if (url.startsWith('dweb:/ipns/')) {
    openLink('ipns', url.slice(11))
  }
}

export default function () {
  // Handle if the app started running now, and a link
  // was sent to be handled.
  for (const arg of process.argv) {
    parseUrl(arg)
  }

  // Handle URLs in macOS
  app.on('open-url', (event, url) => {
    event.preventDefault()
    parseUrl(url)
  })

  // Handle URLs on Windows (hopefully on Linux too)
  app.on('second-instance', (_, argv) => {
    for (const arg of argv) {
      parseUrl(arg)
    }
  })
}
