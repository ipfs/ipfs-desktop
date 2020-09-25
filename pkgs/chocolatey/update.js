#!/usr/bin/env node

const fs = require('fs-extra')
const { join } = require('path')
const semverRegex = require('semver-regex')
const got = require('got')
const crypto = require('crypto')

function hashStream (stream) {
  return new Promise((resolve, reject) => {
    const shasum = crypto.createHash('sha256')
    try {
      stream.on('data', function (data) {
        shasum.update(data)
      })

      stream.on('end', function () {
        const hash = shasum.digest('hex')
        return resolve(hash)
      })
    } catch (error) {
      return reject(error)
    }
  })
}

;(async () => {
  let version = process.argv[2]
  if (!semverRegex().test(version)) {
    console.log('Invalid version:', version)
    process.exit(1)
  }

  if (version.startsWith('v')) {
    version = version.substring(1, version.length)
  }

  console.log('Updating nuspec version...')
  const nuspec = join(__dirname, 'ipfs-desktop.nuspec')
  const nuspecContent = (await fs.readFile(nuspec))
    .toString()
    .replace(/<version>(.)*<\/version>/g, `<version>${version}</version>`)

  await fs.outputFile(nuspec, nuspecContent)

  console.log('Downloading latest binary from:')
  const binaryUrl = `https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v${version}/IPFS-Desktop-Setup-${version}.exe`
  console.log(binaryUrl)

  console.log('Calculating sha256...')
  const hash = await hashStream(got.stream(binaryUrl))
  const script = join(__dirname, 'tools/chocolateyinstall.ps1')

  console.log('Updating script...')
  const scriptContent = (await fs.readFile(script))
    .toString()
    .replace(/\$url = (.)*/g, `$url = '${binaryUrl}'`)
    .replace(/\$checksum = (.)*/g, `$checksum = '${hash.toUpperCase()}'`)

  await fs.outputFile(script, scriptContent)
  console.log('Done!')
  console.log('Please commit the changes, generate new .nupkg and push it to chocolatey.org')
})()
