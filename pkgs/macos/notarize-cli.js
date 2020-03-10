require('dotenv').config()
const { notarize } = require('electron-notarize-dmg')

// Manual online notarization (no stapling) via CLI
// ================================================
// Note: this assumes APPLEID and APPLEIDPASS to be
// set as env variables or set in .env file
//
// Usage:
// 1. Define APPLEID and APPLEIDPASS
// 2. node ./notarize.js path/to/IPFS-Desktop.dmg
//
// Note on stapling and this script:
// We disable stapling of the dmg file, as it changes its contents.  It
// would break auto update files.  It is perfectly okay to notarize and not
// staple to keep the file intact. This requires end users to have connectivity
// to validate the file, but they had it to get .dmg in the first place.

;(async () => {
  const artifactPath = process.argv[2]
  if (!artifactPath || !artifactPath.endsWith('.dmg')) {
    console.log('Missing artifact path: pass .dmg file as CLI argument')
    process.exit(1)
  }
  if (!process.env.APPLEID || !process.env.APPLEIDPASS) {
    console.log('Define APPLEID and APPLEIDPASS as env variables or in .env file')
    process.exit(1)
  }
  console.log(`Initializing notarization of DMG at ${artifactPath}`)
  await notarize({
    appBundleId: 'io.ipfs.desktop',
    dmgPath: artifactPath,
    staple: false,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS
  })
})()
