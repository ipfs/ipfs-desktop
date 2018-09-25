import {dialog} from 'electron'
import { logger } from '../../utils'

const PATH = '/.pinset'

// MIGRATE PINS
export default async function (opts) {
  const { ipfs } = opts

  if (!ipfs()) {
    return
  }

  try {
    await ipfs().files.stat(PATH)
  } catch (e) {
    if (!e.toString().includes('file does not exist')) {
      logger.error(e)
    }

    return
  }

  const buf = await ipfs().files.read(PATH)
  const pins = JSON.parse(buf.toString())

  await ipfs().files.mkdir('/pinset_from_old_ipfs_desktop')

  for (const pin of Object.keys(pins)) {
    let src = pin
    if (!src.startsWith('/ipfs') && !src.startsWith('/ipns')) {
      src = `/ipfs/${src}`
    }

    let dst = pins[pin]
    if (dst === '') {
      dst = pin
    }
    dst = `/pinset_from_old_ipfs_desktop/${dst}`

    await ipfs().files.cp([src, dst])
  }

  await ipfs().files.rm(PATH)

  dialog.showMessageBox({
    type: 'info',
    buttons: ['OK'],
    message: 'Pinned assets were moved to /pinset_from_old_ipfs_desktop. Everything in Files tab is implicitly pinned. You can add new files from the local machine or via IPFS Path.'
  })
}
