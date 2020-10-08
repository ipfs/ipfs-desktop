ManifestDPIAware true

!macro AddToShellSpecific Where
  DeleteRegKey SHELL_CONTEXT "Software\Classes\${Where}\shell\ipfs-desktop"
  WriteRegStr SHELL_CONTEXT "Software\Classes\${Where}\shell\ipfs-desktop" "MUIVerb" "Add to IPFS"
  WriteRegStr SHELL_CONTEXT "Software\Classes\${Where}\shell\ipfs-desktop" "Icon" "$appExe,0"
  WriteRegStr SHELL_CONTEXT "Software\Classes\${Where}\shell\ipfs-desktop\command" "" "$appExe --add=$\"%1$\""
!macroend

!macro AddToShell
  DetailPrint "Adding to Context Menu"
  !insertmacro AddToShellSpecific "*"
  !insertmacro AddToShellSpecific "Directory"
!macroend

!macro AddProtocolHandler Protocol Description
  DeleteRegKey SHELL_CONTEXT "Software\Classes\${Protocol}"
  WriteRegStr SHELL_CONTEXT "Software\Classes\${Protocol}" "" "${Description}"
  WriteRegStr SHELL_CONTEXT "Software\Classes\${Protocol}" "URL Protocol" ""
  WriteRegStr SHELL_CONTEXT "Software\Classes\${Protocol}\DefaultIcon" "" "$appExe,0"
  WriteRegStr SHELL_CONTEXT "Software\Classes\${Protocol}\shell" "" ""
  WriteRegStr SHELL_CONTEXT "Software\Classes\${Protocol}\shell\open" "" ""
  WriteRegStr SHELL_CONTEXT "Software\Classes\${Protocol}\shell\open\command" "" "$appExe $\"%1$\""
!macroend

!macro customInstall
  !insertmacro AddProtocolHandler "ipfs" "IPFS"
  !insertmacro AddProtocolHandler "ipns" "IPNS"
  !insertmacro AddProtocolHandler "dweb" "DWEB"
  !insertmacro AddToShell
!macroend

!macro customUnInstall
  DeleteRegKey SHELL_CONTEXT "ipfs"
  DeleteRegKey SHELL_CONTEXT "Software\Classes\*\shell\ipfs-desktop"
  DeleteRegKey SHELL_CONTEXT "Software\Classes\Directory\shell\ipfs-desktop"
  DeleteRegKey SHELL_CONTEXT "Software\Classes\ipns"
  DeleteRegKey SHELL_CONTEXT "Software\Classes\ipfs"
  DeleteRegKey SHELL_CONTEXT "Software\Classes\dweb"
!macroend

!macro customInit
    # https://github.com/ipfs-shipyard/ipfs-desktop/pull/1679#issuecomment-705630973
    ${if} $installMode == "all"
        ${IfNot} ${UAC_IsAdmin}
            ShowWindow $HWNDPARENT ${SW_HIDE}
            !insertmacro UAC_RunElevated
            Quit
        ${endif}
    ${endif}
!macroend
