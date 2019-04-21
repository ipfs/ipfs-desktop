#!/usr/bin/env node

const homedir = require('os').homedir()
const { readFile } = require('fs')
const { execFile } = require('child_process')
const { join } = require('path')

readFile(join(homedir, '.ipfs/api'), (err, data) => {
  if (err) {
    // TODO: daemon not running?
    return
  }

  const pkg = process.argv[1].includes('npm') ? 'npm' : 'yarn'
  const addr = data.toString()

  const child = execFile('ipfs-npm', [
    ...process.argv.slice(2, process.argv.length),
    '--ipfs-node', addr,
    '--package-manager', join(__dirname, `./${pkg}.bak`)
  ])

  child.stdout.pipe(process.stdout)
  child.stderr.pipe(process.stderr)
  // TODO: HANGS? process.stdin.pipe(child.stdin)
})
