@echo off

if exist "%USERPROFILE%\.ipfs-desktop\IPFS_PATH" (
  SET /P IPFS_PATH=<"%USERPROFILE%\.ipfs-desktop\IPFS_PATH"
)

SET /P IPFS_EXEC=<"%USERPROFILE%\.ipfs-desktop\IPFS_EXEC"
"%IPFS_EXEC%" %*
