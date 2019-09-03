@echo off

if exist "%USERPROFILE%\.ipfs-desktop\IPFS_PATH" (
  SET /P IPFS_PATH=<"%USERPROFILE%\.ipfs-desktop\IPFS_PATH"
)

"%~dp0\..\..\..\..\node_modules\go-ipfs-dep\go-ipfs\ipfs.exe" %*
