const fs = require('fs-extra')
const which = require('which')
const { backup } = require('./backup')
const { argv } = require('yargs')
const { SOURCE_SCRIPT, DEST_SCRIPT } = require('./consts')

let exists = false

try {
  fs.lstatSync(DEST_SCRIPT)
  exists = true
  console.log(`${DEST_SCRIPT} already exists`)
} catch (e) {
  if (!e.toString().includes('ENOENT')) {
    // Some other error
    throw e
  }
}

if (exists) {
  try {
    const link = fs.readlinkSync(DEST_SCRIPT)

    if (link === SOURCE_SCRIPT) {
      console.log('already symlinked')
      process.exit(0)
    }
  } catch (_) {
    // DEST_SCRIPT is not a symlink, ignore.
  }
}

if (which.sync('ipfs', { nothrow: true }) !== null) {
  exists = true
}

if (exists) {
  try {
    backup(argv.data, DEST_SCRIPT)
  } catch (e) {
    if (!e.toString().includes('ENOENT')) {
      // Some other error
      throw e
    }
  }

  fs.unlinkSync(DEST_SCRIPT)
  console.log(`${DEST_SCRIPT} removed`)
}

fs.ensureSymlinkSync(SOURCE_SCRIPT, DEST_SCRIPT)
console.log(`${DEST_SCRIPT} symlinked to ${SOURCE_SCRIPT}`)
