require('dotenv').config()
const { notarize } = require('electron-notarize')

// Manual online notarization (no stapling) via CLI
// ================================================
// Note: this assumes APPLEID and APPLEIDPASS to be
// set as env variables or set in .env file
//
// Usage:
// 1. Define APPLEID and APPLEIDPASS
// 2. node ./notarize.js path/to/IPFS-Desktop.dmg
;(async () => {
  const artifactPath = process.argv[2]
  if (!artifactPath) {
    console.log('Missing artifact path: pass it as CLI argument')
    process.exit(1)
  }
  if (!process.env.APPLEID || !process.env.APPLEIDPASS) {
    console.log('Define APPLEID and APPLEIDPASS as env variables or in .env file')
    process.exit(1)
  }
  await notarize({
    appBundleId: 'io.ipfs.desktop',
    appPath: artifactPath,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS
  })
})()
