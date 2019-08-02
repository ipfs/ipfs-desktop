@echo off

set IPFS_PATH=""

"%~dp0\..\..\..\..\node_modules\go-ipfs-dep\go-ipfs\ipfs.exe" %*
