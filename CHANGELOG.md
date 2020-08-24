# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
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
