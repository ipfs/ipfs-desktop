const { join } = require('path')

module.exports = Object.freeze({
  SOURCE_SCRIPT: join(__dirname, 'ipfs.sh').replace('app.asar', 'app.asar.unpacked'),
  DEST_SCRIPT: '/usr/local/bin/ipfs'
})
