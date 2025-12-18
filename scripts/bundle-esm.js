#!/usr/bin/env node
/**
 * Bundle ESM-only dependencies into CommonJS for Electron compatibility.
 *
 * Electron's main process doesn't support dynamic import() properly,
 * so we pre-bundle the ESM modules into a single CJS file.
 */
const esbuild = require('esbuild')
const path = require('path')

const outfile = path.join(__dirname, '..', 'src', 'esm-bundle.cjs')

async function build () {
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'esm-entry.mjs')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    outfile,
    external: [
      'electron',
      // Native modules that shouldn't be bundled
      'bufferutil',
      'utf-8-validate'
    ],
    // Don't minify for debuggability
    minify: false,
    sourcemap: true
  })
  console.log(`Bundled ESM modules to ${outfile}`)
}

build().catch(err => {
  console.error('Bundle failed:', err)
  process.exit(1)
})
