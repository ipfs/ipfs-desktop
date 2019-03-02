$ErrorActionPreference = 'Stop';
$toolsDir   = "$(Split-Path -parent $MyInvocation.MyCommand.Definition)"

$packageArgs = @{
  packageName     = $env:ChocolateyPackageName
  unzipLocation   = $toolsDir
  fileType        = 'EXE'
  url64bit        = 'https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.7.0-rc.3/ipfs-desktop-setup-0.7.0-rc.3.exe'
  softwareName    = 'IPFS Desktop*'
  checksum64      = '09A10EFB7AF0965006D730AC8DE18B90F08220200EBD7088C8437D5094854E733BF2A97876F0C805F0719FFE7D78B2FCAD31182E260126FF7F53B71A10662C4B'
  checksumType64  = 'sha512'
  silentArgs      = '/S'
  validExitCodes  = @(0)
}

Install-ChocolateyPackage @packageArgs
