/** @type {import('release-please')} */
// const releasePlease = require('release-please')
import {registerPlugin, getPluginTypes} from 'release-please'
import { CustomPlugin } from './plugin'

export function init(...args: unknown[]) {
  console.log('init called with args: ', args)

  // releasePlease.registerPlugin('test-ipfs-desktop-plugin', (options: any) => new CustomPlugin(options.github, options.targetBranch, options.repositoryConfig))
  registerPlugin('test-ipfs-desktop-plugin', (options: any) => new CustomPlugin(options.github, options.targetBranch, options.repositoryConfig))
  // override require so release-please is importing the same release-please as us
  // const oldResult = require.resolve('release-please/build/src/factory')
  // require.cache[oldResult].exports = releasePlease
  console.log('registered test-ipfs-desktop-plugin as a release-please plugin')
  console.log('registered plugins: ', getPluginTypes())
}

init()
