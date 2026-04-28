'use strict'

const path = require('path')
const fs = require('fs-extra')

const webuiPath = process.env.IPFS_WEBUI_PATH
if (!webuiPath) {
  process.exit(0)
}

const src = path.resolve(webuiPath)
const dest = path.resolve(__dirname, '..', 'assets', 'webui')

if (!fs.existsSync(src)) {
  console.error(`IPFS_WEBUI_PATH="${src}" does not exist`)
  process.exit(1)
}

if (!fs.statSync(src).isDirectory()) {
  console.error(`IPFS_WEBUI_PATH="${src}" is not a directory`)
  process.exit(1)
}

if (!fs.existsSync(path.join(src, 'index.html'))) {
  console.error(`IPFS_WEBUI_PATH="${src}" does not contain index.html -- is this a webui build directory?`)
  process.exit(1)
}

console.log(`Copying local webui from ${src} to ${dest}`)
fs.removeSync(dest)
fs.copySync(src, dest)
console.log('Local webui copied successfully.')
