$ErrorActionPreference = 'Stop';

$url = 'https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.10.2/IPFS-Desktop-Setup-0.10.2.exe'
$checksum = '0B391C66E04B7C334507A327ECC9F412246DC92802BBE63961BBCAC12307E356'

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
