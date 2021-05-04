# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.15.0] - 2021-05-04

- IPFS: [`go-ipfs v0.8.0`](https://github.com/ipfs/go-ipfs/releases/tag/v0.8.0)
- UI: [`v2.12.2`](https://github.com/ipfs-shipyard/ipfs-webui/releases/v2.12.2) 

### ✨ Features

- ipfs webui v2.12 with basic support for remote pinning (#1807)
  👉️ see [RELEASE NOTES for v2.12](https://github.com/ipfs-shipyard/ipfs-webui/releases/v2.12.0) for details
- electron 12.x (#1807)

### 🛠 Fixes and Maintenance

- fix: ipfs-on-path should never fail on boot (#1769)
- docs(readme): fix scoop install steps (#1808) 
- docs: promote AppImage for Linux (#1776) 
- chore: switch actions to v2 (#1708) 
- chore(i18n): i18next update and locale sync


## [v0.14.0] - 2021-01-02

- IPFS: [`go-ipfs v0.8.0`](https://github.com/ipfs/go-ipfs/releases/tag/v0.8.0)
- UI: [`v2.11.4`](https://github.com/ipfs-shipyard/ipfs-webui/releases/v2.11.4)

### ✨ Features

- go-ipfs 0.8.0 (#1715 +  [RELEASE NOTES](https://github.com/ipfs/go-ipfs/releases/tag/v0.8.0))
- electron 11.x (#1715)
- improve updating ux (#1758) 
- enable ipns over pubsub via settings menu (#1739)
- disable/enable gc via settings menu (#1740)
- enable pubsub via settings menu (#1735)

### 🛠 Fixes and Maintenance

- fix: timeout during checkIfAddrIsDaemon (#1750)
- fix: default Open WebUI at Launch to true (#1757) 
- fix: autoupdate only on supported platforms (#1698) 
- fix:  specify content-type in prompt template (#1729)
- fix: use correct config path during development (#1690) 
- fix(mac): refresh file list after import (#1767)
- refactor: tray click events (#1766)
- chore: deprecate ipfs-on-path (#1768) and npm-on-ipfs (17578745addb6c665b0c3a3e50499d3967c8efb5)
- docs: rework readme (#1703)
- chore: automated Chocolatey publishing (#1697)
- docs: Homebrew instructions (#1727) 
- docs: brew cask has been deprecated (#1732) 
- chore(i18n): locale sync (https://github.com/ipfs-shipyard/ipfs-desktop/commit/2f1631d2a1f83b98a2ef79bd2a8b37f9696b5a46)


## [v0.13.2] - 2020-10-12
- Web UI: [`v2.11.4`](https://github.com/ipfs-shipyard/ipfs-webui/releases/v2.11.4)
- IPFS: [`go-ipfs v0.7.0`](https://github.com/ipfs/go-ipfs/releases/tag/v0.7.0)

### ✨ Features
- Use `dweb.link` gateway when shareable link is copied to clipboard
- Preserve filename when a single file is shared (screenshot, quick import)

### 🛠 Fixes and Maintenance
- fix: windows auto-update (#1679)
- feat(ci): automated Snapcraft publishing (#1678)
- fix: openItem errors (#1687)
- feat: screenshot improvements (#1689)
- fix: OS integrations for quick file import (#1691)
- fix(windows): autoInstallOnAppQuit (#1682)

#### :mega: Windows users may need to update manually

Below PRs fixed autoupdate issues on Windows platform, however older versions may still struggle to update.

-  fix: windows auto-update (#1679) 
-  fix(windows): autoInstallOnAppQuit (#1682) 

**If your node is unable to apply update to this version, please install [IPFS-Desktop-Setup-0.13.2.exe](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/IPFS-Desktop-Setup-0.13.2.exe) manually.**
From now on, Windows updates should work as expected.

## [v0.13.1] - 2020-10-12
This release is exactly the same as [v0.13.2].
It exists so people can test Windows autoupdate fix on their own.

## [v0.13.0] - 2020-10-08
- Web UI: [`v2.11.4`](https://github.com/ipfs-shipyard/ipfs-webui/releases/v2.11.4)
- IPFS: [`go-ipfs v0.7.0`](https://github.com/ipfs/go-ipfs/releases/tag/v0.7.0)

### ✨ Features
- webui v2.11.4 ([RELEASE NOTES](https://github.com/ipfs-shipyard/ipfs-webui/releases/tag/v2.11.4))
- go-ipfs v0.7.0 ([CHANGELOG](https://github.com/ipfs/go-ipfs/blob/master/CHANGELOG.md#v070-2020-09-22))
- synchronized and added new locales

### 🛠 Fixes and Maintenance
- electron 9 (#1641, 42b069b)
- fix: ensure small asar archive (#1660)
- fix: uppercase Discovery.MDNS.enabled in default config (#1632)
- ci: move to GitHub Actions (#1657)

### 📣 Windows updates may be delayed
Windows 10 users may need to wait a bit longer to see this release.
We are working on a fix.

## [v0.12.2] - 2020-07-17
- Web UI: [`v2.10.2`](https://github.com/ipfs-shipyard/ipfs-webui/releases/v2.10.2)
- IPFS: [`go-ipfs v0.6.0`](https://github.com/ipfs/go-ipfs/releases/tag/v0.6.0)

### ✨ Features
- feat: ipfs-webui v2.10.2

## [v0.12.1] - 2020-07-07
- Web UI: [`v2.9.0`](https://github.com/ipfs-shipyard/ipfs-webui/releases/v2.9.0)
- IPFS: [`go-ipfs v0.6.0`](https://github.com/ipfs/go-ipfs/releases/tag/v0.6.0)

### ✨ Features
- feat: ipfs-webui v2.9.0 (#1531)
- feat: go-ipfs 0.6 (#1526)

### 🛠 Fixes and Maintenance

- fix: windows auto-update feature when selecting install for all users (#1556)
## [v0.12.0] - 2020-07-06
- Web UI: [`v2.9.0`](https://github.com/ipfs-shipyard/ipfs-webui/releases/v2.9.0)
- IPFS: [`go-ipfs v0.6.0`](https://github.com/ipfs/go-ipfs/releases/tag/v0.6.0)

### 🛠 Fixes and Maintenance

- feat: ipfs-webui v2.9.0 (#1531)
- feat: go-ipfs 0.6 (#1526)
- fix: windows auto-update feature when selecting install for all users (#1556)
## [v0.11.4] - 2020-05-21
- Web UI: [`v2.8.0`](https://github.com/ipfs-shipyard/ipfs-webui/releases/v2.8.0)
- IPFS: [`go-ipfs v0.5.1`](https://github.com/ipfs/go-ipfs/releases/tag/v0.5.1)

### 🛠 Fixes and Maintenance

- chore: update dependencies
## [v0.11.3] - 2020-05-18
- IPFS: [`go-ipfs v0.5.1`](https://github.com/ipfs/go-ipfs/releases/tag/v0.5.1)

### 🛠 Fixes and Maintenance

- chore: update dependencies
## [v0.11.2] - 2020-04-30
- Web UI: [`v2.8.0`](https://github.com/ipfs-shipyard/ipfs-webui/releases/v2.8.0) ✨
- IPFS: [`go-ipfs v0.5.0`](https://github.com/ipfs/go-ipfs/releases/tag/v0.5.0) ✨ 

### 🛠 Fixes and Maintenance

- fix: open directory from webui (https://github.com/ipfs-shipyard/ipfs-desktop/pull/1472)
## [v0.11.1] - 2020-04-29
- Web UI: [`v2.8.0`](https://github.com/ipfs-shipyard/ipfs-webui/releases/v2.8.0) ✨
- IPFS: [`go-ipfs v0.5.0`](https://github.com/ipfs/go-ipfs/releases/tag/v0.5.0) ✨ 

### 🚨 Breaking Changes

- fix: remove old auto launch method (#1416)
- fix: ipfs daemon flags (#1437)

### ✨  Features

- feat: support for go-ipfs 0.5 (#1392) 
- feat: run garbage collector (#1407)
- feat: update ipfsd-ctl to 4.x (#1411)
- feat: improved update experience (#1414)
- feat(ux): improve download cid (#1419)
- feat(ux): improve gc (#1420)
- feat(ux): better error messages (#1421)
- feat(ux): separate open from other actions (#1424)
- feat(ux): move preferences to menubar (#1425) 
- feat: allow custom ipfs binary (#1427)
- feat(ux): open web ui at login (#1429)
- feat: add "Help Translation" under "About" (#1447)
- feat: go-ipfs 0.5 (https://github.com/ipfs-shipyard/ipfs-desktop/pull/1463)

### 🛠 Fixes and Maintenance

- fix: drag&drop files and folders (https://github.com/ipfs-shipyard/ipfs-desktop/issues/1287#issuecomment-620604299)
- fix: start on login (#1334)
- fix: notify when new update is available (#1384)
- chore: update to electron 8.x (#1404)
- fix: write path when it does not exist (#1405)
- refactor: remove babel (#1406)
- fix: circular dependency between dialogs and daemon (#1408)
- fix: use portfinder instead of get-port (#1410)
- fix: screenshot taking (#1418)
- fix: disable updates in development (#1423)
- docs: clarify protocol usage (#1426)
- fix: translate 'Select Directory' (#1428)
- refactor: move utilities to utils directory (#1434)
- fix: repo fsck is deprecated (#1438)
- refactor: use store migrations and defaults (#1443)
- fix(ux): show dock when prompt is visible (#1450)
- fix: keep track of last opened page (#1452)
- fix: ipfs on PATH on windows with spaces in binary path #1465
- fix: go-ipfs 0.5.0 with go-ipfs-dep 0.5.0 #1464
- fix: macOS notarization with stappling (f01eb6b)
## [v0.11.0] - 2020-04-29
Skipped due to issues with macOS notarization.
Use [v0.11.1](https://github.com/ipfs-shipyard/ipfs-desktop/releases/tag/v0.11.1) instead.
## [v0.10.4] - 2020-03-12
- Web UI: [`v2.7.2`](https://github.com/ipfs-shipyard/ipfs-webui/releases/tag/v2.7.2)
- IPFS: [`go-ipfs v0.4.23`](https://github.com/ipfs/go-ipfs/releases/tag/v0.4.23)

### 🛠 Fixes and Maintenance

- i18n: sync locales (#1347)
- chore: macOS notarizing scripts and proces (#1365)
- fix: startup on Debian 10 (#1370)
## [v0.10.3] - 2020-02-04
- Web UI: [`v2.7.2`](https://github.com/ipfs-shipyard/ipfs-webui/releases/tag/v2.7.2)
- IPFS: [`go-ipfs v0.4.23`](https://github.com/ipfs/go-ipfs/releases/tag/v0.4.23)

### ✨  Features

- I18N: `ja-JP`, `he-IL` and `hi-IN` locales (#1339)

### 🛠 Fixes and Maintenance

- fix: start with off icon (#1300)
- chore: dependency updates (#1341)
