require('dotenv').config()
const { notarize } = require('electron-notarize')

const isSet = (value) => value && value !== 'false'

// electron-build hook to be used in electron-build pipeline in the future
// ===========================================================================
// Note: for now we don't use this at the moment.
// Run ./notarize-cli.js instead
exports.default = async function notarizing (context) {
  const { electronPlatformName, appOutDir } = context
  if (electronPlatformName !== 'darwin') return
  // skip notarization if secrets are not present in env
  if (!process.env.APPLEID || !process.env.APPLEIDPASS) return
  // skip notarization when signing is disabled in PRs
  // https://github.com/electron-userland/electron-builder/commit/e1dda14
  if (isSet(process.env.TRAVIS_PULL_REQUEST) ||
    isSet(process.env.CI_PULL_REQUEST) ||
    isSet(process.env.CI_PULL_REQUESTS)) return

  const appName = context.packager.appInfo.productFilename

  return notarize({
    appBundleId: 'io.ipfs.desktop',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS
  })
}
