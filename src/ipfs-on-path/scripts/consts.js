import { join } from 'path'

export const SOURCE_SCRIPT = join(__dirname, 'ipfs.sh').replace('app.asar', 'app.asar.unpacked')
export const DEST_SCRIPT = '/usr/local/bin/ipfs'
