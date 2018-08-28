import {dialog} from 'electron'
const PATH = '/.pinset'

// MIGRATE PINS
export default async function (opts) {
  const { ipfs } = opts

  if (!ipfs()) {
    return
  }

  try {
    await ipfs().files.stat(PATH)
  } catch (_) {
    return
  }

  const buf = await ipfs().files.read(PATH)
  const pins = JSON.parse(buf.toString())

  await ipfs().files.mkdir('/pinset_from_old_ipfs')

  for (const pin of Object.keys(pins)) {
    let src = pin
    if (!src.startsWith('/ipfs')) {
      src = `/ipfs/${src}`
    }

    let dst = pins[pin]
    if (dst === '') {
      dst = pin
    }
    dst = `/pinset_from_old_ipfs/${dst}`

    await ipfs().files.cp([src, dst])
  }

  await ipfs().files.rm(PATH)

  dialog.showMessageBox({
    message: 'Pinned assets were moved to /pinset_from_old_ipfs. Everything in Files tab is implicitly pinned. You can add new files from the local machine or via IPFS Path.'
  })
}
