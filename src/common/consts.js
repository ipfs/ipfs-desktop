import os from 'os'

export const IS_MAC = os.platform() === 'darwin'
export const IS_WIN = os.platform() === 'win32'
