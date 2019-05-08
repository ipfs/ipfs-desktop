#!/usr/bin/env node

const homedir = require('os').homedir()
const { readFile } = require('fs')
const { execFile } = require('child_process')
const { join } = require('path')

readFile(join(homedir, '.ipfs/api'), (err, data) => {
  const pkg = process.argv[1].includes('npm') ? 'npm' : 'yarn'
  const addr = data.toString()
  let args = [
    ...process.argv.slice(2, process.argv.length),
    '--package-manager', join(__dirname, `./${pkg}.bak`)
  ]

  if (!err) {
    // daemon not running.
    args.push('--ipfs-node', addr)
  }

  const child = execFile('ipfs-npm', args)
  child.stdout.pipe(process.stdout)
  child.stderr.pipe(process.stderr)
})
