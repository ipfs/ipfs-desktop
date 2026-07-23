'use strict'

// The electron package does not download its binary during `postinstall` (npm
// supply-chain hardening); it is fetched lazily on first run of the electron
// bin. Our tests `require('electron')` in a plain Node context, which reads
// node_modules/electron/path.txt synchronously, so the binary must be on disk
// before the (parallel) Playwright workers start.
//
// We download via @electron/get (awaited, so a failed fetch is loud) and
// extract with the platform's system unzip. Electron's own install.js extracts
// on an async code path with no lock around node_modules/electron/dist, which
// on the CI runners has exited mid-extract (leaving an empty dist/) or hung. A
// single synchronous, time-bounded system extraction avoids both.

const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const electronDir = path.dirname(require.resolve('electron/package.json'))
const pathTxt = path.join(electronDir, 'path.txt')
const distDir = path.join(electronDir, 'dist')
const version = require(path.join(electronDir, 'package.json')).version

const fromElectron = (name) => require(require.resolve(name, { paths: [electronDir] }))

function platformExe () {
  switch (process.platform) {
    case 'darwin':
    case 'mas': return 'Electron.app/Contents/MacOS/Electron'
    case 'win32': return 'electron.exe'
    default: return 'electron'
  }
}

function unzip (zipPath, dest) {
  fs.mkdirSync(dest, { recursive: true })
  const opts = { stdio: 'inherit', timeout: 3 * 60 * 1000 }
  if (process.platform === 'win32') {
    // bsdtar ships with Windows runners and extracts zip archives.
    execFileSync('tar', ['-xf', zipPath, '-C', dest], opts)
  } else if (process.platform === 'darwin') {
    // ditto preserves the .app bundle's symlinks and permissions.
    execFileSync('ditto', ['-x', '-k', zipPath, dest], opts)
  } else {
    execFileSync('unzip', ['-q', '-o', zipPath, '-d', dest], opts)
  }
}

function alreadyInstalled () {
  if (!fs.existsSync(pathTxt)) return false
  return fs.existsSync(path.join(distDir, fs.readFileSync(pathTxt, 'utf8').trim()))
}

async function main () {
  if (alreadyInstalled()) {
    console.log('[ensure-electron] already installed')
    return
  }

  const { downloadArtifact } = fromElectron('@electron/get')
  console.log(`[ensure-electron] downloading electron ${version} for ${process.platform}/${process.arch}`)
  const zipPath = await downloadArtifact({ version, artifactName: 'electron', platform: process.platform, arch: process.arch })
  console.log(`[ensure-electron] downloaded ${path.basename(zipPath)} (${fs.statSync(zipPath).size} bytes); extracting`)

  fs.rmSync(distDir, { recursive: true, force: true })
  unzip(zipPath, distDir)

  const exe = platformExe()
  if (!fs.existsSync(path.join(distDir, exe))) {
    throw new Error(`[ensure-electron] extracted archive is missing ${exe}`)
  }
  fs.writeFileSync(pathTxt, exe)
  console.log('[ensure-electron] ready:', exe)
}

main().catch((err) => {
  console.error('[ensure-electron] FAILED:', (err && err.stack) || err)
  process.exit(1)
})
