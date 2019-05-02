const fs = require('fs-extra')
const which = require('which')
const { backup } = require('../../../utils/scripts/backup')
const argv = require('yargs').argv
const { join } = require('path')

const SCRIPT_BIN = join(__dirname, 'npm.js').replace('app.asar', 'app.asar.unpacked')

function replace (bin) {
  const path = which.sync(bin, { nothrow: true })
  if (!path) {
    console.log(`could not locate ${bin}, not replacing`)
    return true // is ok
  }

  try {
    fs.lstatSync(path)
    console.log(`${path} already exists`)
  } catch (e) {
    if (!e.toString().includes('ENOENT')) {
      // Some other error
      throw e
    }
  }

  try {
    const link = fs.readlinkSync(path)

    if (link === SCRIPT_BIN) {
      console.log('already symlinked')
      return true
    }
  } catch (_) {
    // path is not a symlink, ignore.
  }

  try {
    backup(argv.data, SCRIPT_BIN)
  } catch (e) {
    if (!e.toString().includes('ENOENT')) {
      // Some other error
      throw e
    }
  }

  fs.unlinkSync(SCRIPT_BIN)
  console.log(`${SCRIPT_BIN} removed`)

  fs.ensureSymlinkSync(SCRIPT_BIN, path)
  console.log(`${path} symlinked to ${SCRIPT_BIN}`)
}

replace('npm')
replace('yarn')
