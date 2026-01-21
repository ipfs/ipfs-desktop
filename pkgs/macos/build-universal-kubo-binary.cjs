const { path: getKuboBinary, download: downloadKubo } = require('kubo')
const path = require('path')
const tmp = require('tmp')
const fs = require('fs')
const os = require('os')
const { execSync } = require('child_process')

const execLog = (cmd) => {
  try {
    console.log(execSync(cmd).toString())
  } catch (error) {
    console.log(`→ "${cmd}" errored`)
    console.error(error.stderr.toString())
    process.exit(1)
  }
}

;(async () => {
  if (os.platform() !== 'darwin') {
    // skip when we are not running on macos
    return
  }

  // Remove single-platform binary
  const ipfsBinaryPath = getKuboBinary()
  console.log('→ lipo info before merging binaries')
  execLog(`lipo "${ipfsBinaryPath}" -info`)
  if (fs.existsSync(ipfsBinaryPath)) {
    // removing binary, just to be sure we dont
    // silently ship it if lipo operations fail
    fs.unlinkSync(ipfsBinaryPath)
    console.log(`Removed ${ipfsBinaryPath}, will be replaced by universal one`)
  }

  const packageJsonPath = require.resolve(path.join('kubo', 'package.json'))
  const kuboVersion = `v${require(packageJsonPath).version}`

  const tmpDir = tmp.dirSync({ prefix: 'kubo-universal' }).name
  const architectures = ['amd64', 'arm64']
  for (const arch of architectures) {
    const archDir = path.join(tmpDir, `kubo-${arch}`)
    await downloadKubo({
      version: kuboVersion,
      platform: 'darwin',
      arch: arch,
      distUrl: 'https://dist.ipfs.tech',
      installPath: archDir
    })
    console.log(`→ Downloaded ${arch} version to ${archDir}`)
  }
  const intelBinary = path.join(tmpDir, 'kubo-amd64', 'kubo', 'ipfs')
  const armBinary = path.join(tmpDir, 'kubo-arm64', 'kubo', 'ipfs')

  console.log('→ lipo merging binaries')
  execLog(`lipo -create "${intelBinary}" "${armBinary}" -output "${ipfsBinaryPath}"`)

  console.log('→ lipo info after merging binaries')
  execLog(`lipo "${ipfsBinaryPath}" -info`)

  execLog(`lipo "${ipfsBinaryPath}" -verify_arch x86_64`)
  execLog(`lipo "${ipfsBinaryPath}" -verify_arch arm64`)

  console.log(`→ macOS lipo command executed successfully, universal Kubo binary saved at ${ipfsBinaryPath}`)
})()
