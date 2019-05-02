import { execFileSync } from 'child_process'
import { logger } from '../../utils'

export function update () {
  try {
    logger.info('[npm on ipfs] ipfs-npm: checking if outdated')

    // NOTE: might fail on older NPM (< 6.9.1) versions
    // https://github.com/npm/cli/pull/173
    const out = execFileSync('npm', ['outdated', '-g'])

    if (out.indexOf('ipfs-npm') === -1) {
      logger.info('[npm on ipfs] ipfs-npm: is up to date')
      return
    }
  } catch (e) {
    logger.error('[npm on ipfs] ipfs-npm: could not check if up to date %v', e)
  }

  logger.info('[npm on ipfs] ipfs-npm: is out to date, will update')
  install()
}

export function install () {
  try {
    execFileSync('npm', ['install', '-g', 'ipfs-npm'])
    logger.info('[npm on ipfs] ipfs-npm: installed globally')
    return true
  } catch (e) {
    logger.error('[npm on ipfs] ', e)
    return false
  }
}
