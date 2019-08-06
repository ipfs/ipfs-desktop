@echo off

if exist "%~dp0\..\IPFS_PATH" (
  SET /P IPFS_PATH=<"%~dp0\..\IPFS_PATH"
)

"%~dp0\..\..\..\..\node_modules\go-ipfs-dep\go-ipfs\ipfs.exe" %*
