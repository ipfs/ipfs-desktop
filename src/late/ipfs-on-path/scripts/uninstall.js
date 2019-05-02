const { DEST_SCRIPT } = require('./consts')
const { revert } = require('../../../utils/scripts/backup')
const argv = require('yargs').argv

revert(argv.data, 'ipfs', DEST_SCRIPT)
