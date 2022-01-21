const { argv } = require('yargs')
const fs = require('fs-extra')
const { join } = require('path')

function checkErr (err) {
  // NOTE: there is a bug where copySync will throw if the inode
  // from the src and dst are equal. In the case of symlinks, that'll happen.
  // https://github.com/jprichardson/node-fs-extra/issues/657
  if (!err.toString().includes('Source and destination must not be the same')) {
    throw err
  }
}

function revert (userData, bin, dst) {
  const backup = join(userData, bin + '.bak')


  try {
    fs.unlinkSync(backup)
  } catch (_) {
    // Failed to remove the backup. Suprising, but not worth bothering the user about.
  }
}

revert(argv.data, 'ipfs', '/usr/local/bin/ipfs')
