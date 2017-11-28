import {resolve, join} from 'path'

const logosDir = resolve(__dirname, '../../node_modules/ipfs-logo')

export const logoWiderStrokes = join(logosDir, 'raster', 'ipfs-logo-wider-strokes-white.png')
export const macOsMenuBar = join(logosDir, 'platform-icons', 'osx-menu-bar@2x.png')

export function getLogo (options = {}) {
  Object.assign(options, {
    size: 512,
    color: 'ice',
    text: false,
    outline: false
  })

  let filename = 'ipfs-logo'

  if (options.text) filename += '-text'
  filename += `-${options.size}-${options.color}`
  if (options.outline) filename += '-outline'
  filename += '.png'

  return join(logosDir, 'raster-generated', filename)
}
