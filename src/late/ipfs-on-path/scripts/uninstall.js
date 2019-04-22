const { DEST_SCRIPT } = require('./consts')
const { revert } = require('../../../utils/scripts/backup')
const getArg = require('../../../utils/scripts/args')

revert(getArg('user-data'), 'ipfs', DEST_SCRIPT)
