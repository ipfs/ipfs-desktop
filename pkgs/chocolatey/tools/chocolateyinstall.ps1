$ErrorActionPreference = 'Stop';

$url = 'https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.10.3/IPFS-Desktop-Setup-0.10.3.exe'
$checksum = '6BC43ECB86375F3BAD7AC7E678933922AC75EABF0B123541E54A9869BAFD3BF9'

$packageArgs = @{
  packageName   = 'ipfs-desktop'
  fileType      = 'EXE'
  softwareName  = 'ipfs-desktop'
  url           = $url
  checksum      = $checksum
  checksumType  = 'sha256'
  silentArgs    = "/S"
  validExitCodes= @(0)
}

Install-ChocolateyPackage @packageArgs
