ManifestDPIAware true

!macro customInstall
  WriteRegStr SHELL_CONTEXT "Software\Classes\*\shell\ipfs-desktop" "MUIVerb" "Add to IPFS"
  WriteRegStr SHELL_CONTEXT "Software\Classes\*\shell\ipfs-desktop" "Icon" "$appExe,0"
  WriteRegStr SHELL_CONTEXT "Software\Classes\*\shell\ipfs-desktop\command" "" "$appExe --add=$\"%1$\""

  WriteRegStr SHELL_CONTEXT "Software\Classes\Directory\shell\ipfs-desktop" "MUIVerb" "Add to IPFS"
  WriteRegStr SHELL_CONTEXT "Software\Classes\Directory\shell\ipfs-desktop" "Icon" "$appExe,0"
  WriteRegStr SHELL_CONTEXT "Software\Classes\Directory\shell\ipfs-desktop\command" "" "$appExe --add=$\"%1$\""
!macroend

!macro customUnInstall
  DeleteRegKey SHELL_CONTEXT "Software\Classes\*\shell\ipfs-desktop"
  DeleteRegKey SHELL_CONTEXT "Software\Classes\Directory\shell\ipfs-desktop"
!macroend
