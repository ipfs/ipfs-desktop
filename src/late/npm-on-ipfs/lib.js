import { execFileSync } from 'child_process'
import which from 'which'
import path from 'path'
import fs from 'fs-extra'
import { logger, store } from '../../utils'

const BIN = path.join(__dirname, '_bin.js')

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
  installNpmOnIpfs()
}

function installNpmOnIpfs () {
  try {
    execFileSync('npm', ['install', '-g', 'ipfs-npm'])
    logger.info('[npm on ipfs] ipfs-npm: installed globally')
    return true
  } catch (e) {
    // TODO: tell the user
    logger.error('[npm on ipfs] %v', e)
    return false
  }
}

function backup (original) {
  const bin = original.split('/').pop()
  const backup = path.join(__dirname, bin + '.bak')

  try {
    fs.copySync(original, backup)
  } catch (e) {
    // NOTE: there is a bug where copySync will throw if the inode
    // from the src and dst are equal. In the case of symlinks, that'll happen.
    // https://github.com/jprichardson/node-fs-extra/issues/657
    if (!e.toString().includes('Source and destination must not be the same')) {
      throw e
    }
  }

  logger.info('[npm on ipfs] backed up %s binary to %s', bin, backup)
}

function replace (bin) {
  logger.info(`[npm on ipfs] ${bin} binary: start replacing`)

  // TODO: break into more try catches so we can revert if any error happens

  const path = which.sync(bin, { nothrow: true })
  if (!path) {
    logger.error(`[npm on ipfs] could not locate ${bin}, not replacing`)
    return true // is ok
  }

  try {
    const stats = fs.lstatSync(path)

    if (stats.isSymbolicLink()) {
      const target = fs.readlinkSync(path)
      if (target === BIN) {
        logger.info(`[npm on ipfs] ${bin} already pointing to our script`)
        return
      }
    }

    backup(path)
    fs.unlinkSync(path)
    fs.symlinkSync(BIN, path)
    logger.info(`[npm on ipfs] ${path} symlinked to ${BIN}`)
    return true
  } catch (e) {
    logger.error('[npm on ipfs] ', e)
    return false
  }
}

function replaceRevert (bin) {
  logger.info(`[npm on ipfs] ${bin} binary: start revert replacing`)

  const original = which.sync(bin, { nothrow: true })
  if (!original) {
    logger.error(`[npm on ipfs] could not locate ${bin}, not replacing`)
    return true // is ok
  }

  const bak = path.join(__dirname, bin + '.bak')

  try {
    fs.unlinkSync(original)
    fs.copySync(bak, original)
    fs.unlinkSync(bak)

    logger.info(`[npm on ipfs] ${bin} reverted`)
    return true
  } catch (e) {
    logger.error('[npm on ipfs] ', e)
    return false
  }
}

export function install () {
  if (!installNpmOnIpfs()) {
    return
  }

  if (!replace('npm')) {
    return
  }

  if (!replace('yarn')) {
    return
  }

  store.set('npm.installed', true)
}

export function uninstall () {
  if (!replaceRevert('npm')) {
    return
  }

  if (!replaceRevert('yarn')) {
    return
  }

  // TODO: should we uninstall ipfs-npm too?
  store.set('npm.installed', false)
}
