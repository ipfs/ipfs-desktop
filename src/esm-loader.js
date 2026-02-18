// @ts-check
/**
 * ESM Loader for CommonJS compatibility
 *
 * This module handles loading ESM-only packages (ipfsd-ctl, kubo-rpc-client,
 * @multiformats/multiaddr, @multiformats/multiaddr-to-uri) and exposes them
 * synchronously to the rest of the CommonJS codebase.
 *
 * The ESM modules are pre-bundled into CJS format by scripts/bundle-esm.js
 * to work around Electron's lack of dynamic import() support in the main process.
 */

/**
 * @typedef {object} EsmModules
 * @property {import('ipfsd-ctl').createNode} createNode
 * @property {import('kubo-rpc-client').create} create
 * @property {import('kubo-rpc-client').globSource} globSource
 * @property {import('@multiformats/multiaddr').multiaddr} multiaddr
 * @property {import('@multiformats/multiaddr-to-uri').multiaddrToUri} multiaddrToUri
 */

/** @type {EsmModules | null} */
let modules = null

/**
 * Load all ESM modules. Must be called once at app startup.
 * @returns {Promise<EsmModules>}
 */
async function loadEsmModules () {
  if (modules) return modules

  // Load the pre-bundled ESM modules (bundled to CJS by scripts/bundle-esm.js)
  const bundle = require('./esm-bundle.cjs')

  modules = {
    createNode: bundle.createNode,
    create: bundle.create,
    globSource: bundle.globSource,
    multiaddr: bundle.multiaddr,
    multiaddrToUri: bundle.multiaddrToUri
  }

  return modules
}

/**
 * Get loaded ESM modules synchronously.
 * Throws if modules haven't been loaded yet.
 * @returns {EsmModules}
 */
function getModules () {
  if (!modules) {
    throw new Error('ESM modules not loaded yet. Call loadEsmModules() first during app startup.')
  }
  return modules
}

/**
 * Get ESM modules asynchronously.
 * Will load if not already loaded.
 * @returns {Promise<EsmModules>}
 */
async function getModulesAsync () {
  if (modules) return modules
  return loadEsmModules()
}

module.exports = { loadEsmModules, getModules, getModulesAsync }
