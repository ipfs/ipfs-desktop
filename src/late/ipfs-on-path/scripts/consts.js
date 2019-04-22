const { join } = require('path')

module.exports = {
  SOURCE_SCRIPT: join(__dirname, 'ipfs.sh'),
  DEST_SCRIPT: '/usr/local/bin/ipfs'
}
