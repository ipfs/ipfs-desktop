import fs from 'fs-extra'
import { join } from 'path'
import os from 'os'
import { logger } from '../utils'

export default function () {
  // Note: during runtime, we only do this for darwin.
  if (os.platform() !== 'darwin') {
    return
  }

  // Ignore during development because the paths are not the same.
  if (process.env.NODE_ENV === 'development') {
    logger.info('[ipfs on path] unavailable during development')
    return
  }

  // Don't make any changes if IPFS already exists...
  if (fs.existsSync('/usr/local/bin/ipfs')) {
    logger.info('[ipfs on path] was not added, already exists')
    return
  }

  try {
    fs.symlinkSync(join(__dirname, '../../../bin/ipfs.sh'), '/usr/local/bin/ipfs')
    logger.info('[ipfs on path] added to /usr/local/bin/ipfs')
  } catch (e) {
    logger.error(e)
  }
}
