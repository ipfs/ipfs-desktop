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

function backup (userData, original) {
  const bin = original.split('/').pop()
  const backup = join(userData, bin + '.bak')

  try {
    fs.copySync(original, backup)
  } catch (err) {
    checkErr(err)
  }

  console.log(`${original} copied to ${backup}`)
}

function revert (userData, bin, dst) {
  const backup = join(userData, bin + '.bak')

  try {
    fs.removeSync(dst)
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err
    }
  }

  try {
    fs.copySync(backup, dst)
    console.log(`${backup} restored to ${dst}`)
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`${backup} not found, skipping`)
      return
    }

    checkErr(err)
  }

  try {
    fs.unlinkSync(backup)
  } catch (_) {
    // Failed to remove the backup. Suprising, but not worth bothering the user about.
  }
}

module.exports = Object.freeze({
  backup,
  revert
})
