$ErrorActionPreference = 'Stop';

$url = 'https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.7.2/ipfs-desktop-setup-0.7.2.exe'
$checksum = '07C67E3D6156B7A4C11CCD4C4770A1CE27F3EB3AC686F30956CE2B693D44F2B4'

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
