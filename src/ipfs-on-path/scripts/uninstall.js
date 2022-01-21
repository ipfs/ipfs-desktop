const { argv } = require('yargs')
const fs = require('fs-extra')
const { join } = require('path')

function revert (userData, bin, dst) {
  const backup = join(userData, bin + '.bak')

  try {
    fs.unlinkSync(backup)
  } catch (_) {
    // Failed to remove the backup. Suprising, but not worth bothering the user about.
  }
}

revert(argv.data, 'ipfs', '/usr/local/bin/ipfs')
