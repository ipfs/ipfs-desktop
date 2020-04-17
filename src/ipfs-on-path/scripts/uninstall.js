const { DEST_SCRIPT } = require('./consts')
const { revert } = require('./backup')
const { argv } = require('yargs')

revert(argv.data, 'ipfs', DEST_SCRIPT)
