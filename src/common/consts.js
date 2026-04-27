const os = require('os')
const packageJson = require('../../package.json')

const IS_MAC = os.platform() === 'darwin'
const IS_WIN = os.platform() === 'win32'
const IS_APPIMAGE = typeof process.env.APPIMAGE !== 'undefined'
const VERSION = packageJson.version
const ELECTRON_VERSION = process.versions.electron
const KUBO_VERSION = packageJson.dependencies.kubo
const COUNTLY_KEY = process.env.NODE_ENV === 'development'
  ? '6b00e04fa5370b1ce361d2f24a09c74254eee382'
  : '47fbb3db3426d2ae32b3b65fe40c564063d8b55d'

module.exports = {
  IS_MAC,
  IS_WIN,
  IS_APPIMAGE,
  VERSION,
  ELECTRON_VERSION,
  KUBO_VERSION,
  COUNTLY_KEY
}
