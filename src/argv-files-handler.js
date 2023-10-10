const fs = require('fs-extra')
const addToIpfs = require('./add-to-ipfs')

async function argvHandler (argv) {
  let handled = false

  const files = []
  for (const arg of argv.slice(1)) {
    if (!arg.startsWith('--add')) {
      continue
    }

    const filename = arg.slice(6)

    if (await fs.pathExists(filename)) {
      files.push(filename)
    }
  }

  if (files.length > 0) {
    await addToIpfs(files)
    handled = true
  }

  return handled
}

module.exports = async function () {
  // Checks current process
  await argvHandler(process.argv)
}

module.exports.argvHandler = argvHandler
