$ErrorActionPreference = 'Stop';

$url = 'https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.9.4/IPFS-Desktop-Setup-0.9.4.exe'
$checksum = 'F108516DD6ABBF27B2D165B606D8ADBF84B39F1B26B5B7292BEB2B70916D8101'

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
