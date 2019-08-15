import os from 'os'
import packageJson from '../../package.json'

export const IS_MAC = os.platform() === 'darwin'

export const IS_WIN = os.platform() === 'win32'

export const VERSION = packageJson.version

export const GO_IPFS_VERSION = packageJson['go-ipfs']
  ? packageJson['go-ipfs'].version.slice(1)
  : packageJson.dependencies['go-ipfs-dep']
