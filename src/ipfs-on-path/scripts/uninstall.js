import { DEST_SCRIPT } from './consts'
import { revert } from './backup'
import { argv } from 'yargs'

revert(argv.data, 'ipfs', DEST_SCRIPT)
