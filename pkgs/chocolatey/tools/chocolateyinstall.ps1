$ErrorActionPreference = 'Stop';

$url = 'https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.8.0/ipfs-desktop-setup-0.8.0.exe'
$checksum = '79EA1C1A1AC86D711049233B7B767DE507AC9A35594B1C867EC9EBFEF586048E'

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
