import path from 'path'
import os from 'os'

export default function (color) {
  const p = path.resolve(path.join(__dirname, '../icons'))

  if (os.platform() === 'darwin') {
    return path.join(p, `${color}.png`)
  }

  return path.join(p, `${color}-big.png`)
}
