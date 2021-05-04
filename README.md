# IPFS Desktop

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](https://protocol.ai/)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![](https://david-dm.org/ipfs-shipyard/ipfs-desktop.svg?style=flat-square)](https://david-dm.org/ipfs-shipyard/ipfs-desktop)
[![total download count](https://img.shields.io/github/downloads/ipfs-shipyard/ipfs-desktop/total.svg?style=flat-square&label=all%20downloads)](https://github.com/ipfs-shipyard/ipfs-desktop/releases)
[![latest release download count](https://img.shields.io/github/downloads/ipfs-shipyard/ipfs-desktop/v0.15.0/total.svg?style=flat-square)](https://github.com/ipfs-shipyard/ipfs-desktop/releases/tag/v0.15.0)

**IPFS Desktop gives you all the power of [IPFS](https://ipfs.io) in a convenient desktop app: a complete IPFS node, plus handy OS menubar/taskbar shortcuts and an all-in-one file manager, peer map, and content explorer.**

Use IPFS Desktop to get acquainted with IPFS without needing to touch the terminal — or, if you're already experienced, use the powerful menubar/taskbar shortcuts alongside the command line to make your IPFS workflow faster.

![Status screen of IPFS Desktop](https://gateway.ipfs.io/ipfs/QmYHuXitXMf5xTjiQXmXdqszvMTADvrM5zA7EqoDj3d3RH)

| Files screen | Explore screen | Peers screen | Settings screen | Menubar/taskbar |
|-------|---------|-------|----------|------|
| ![Screenshot of the Files screen](https://gateway.ipfs.io/ipfs/QmRN82RPWHKuSuBadijTQuaCjFKAGaymt3aFBoG6Du9Vi3) | ![Screenshot of the Explore screen](https://gateway.ipfs.io/ipfs/Qmaerxh9UKf9F3YPKnV2cBEnPQoJdVmkswFdz7kNQGncKt) | ![Screenshot of the Peers screen](https://gateway.ipfs.io/ipfs/QmaVbBYsEBb34HMP1YWeErrS7X3TB6Y9t1iQ4sBRnTvSwa) | ![Screenshot of the Settings screen](https://gateway.ipfs.io/ipfs/Qmby5RuN7K9s5W9RVLdrQSE8gRKQ66EX8c39iC31DLAxN6) | ![Screenshot of Mac/Windows menus](https://gateway.ipfs.io/ipfs/QmbT2YtuNo17Qaq31FJWRZgRMY4E6N9cdfBwzZTFSHUoBP) |

### Quick-install shortcuts

When in doubt, pick one of package formats with built-in automatic update mechanism:

- **Mac:** [IPFS-Desktop-0.15.0.dmg](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.15.0/IPFS-Desktop-0.15.0.dmg)
- **Windows:** [IPFS-Desktop-Setup-0.15.0.exe](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.15.0/IPFS-Desktop-Setup-0.15.0.exe)
- **Linux:**  [ipfs-desktop-0.15.0-linux-x86_64.AppImage](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.15.0/ipfs-desktop-0.15.0-linux-x86_64.AppImage)
  - If you prefer to manage updates on your own, see [other package formats](#install) below.

## Table of Contents

- [Features](#features)
- [Install](#install)
- [Contribute](#contribute) or [Translate](#translations)
- [FAQ & Troubleshooting](#faq--troubleshooting)

## Features

IPFS Desktop combines a complete IPFS node (running [go-ipfs](https://github.com/ipfs/go-ipfs)) and the [IPFS Web UI](https://github.com/ipfs-shipyard/ipfs-webui) into a single, convenient desktop app — plus adds a menu to your OS menubar/system tray for easy access to a variety of common IPFS tasks.

If you already have an IPFS node on your computer, IPFS Desktop will act as a control panel and file browser for that node. If you don't have a node, it'll install one for you. And either way, IPFS Desktop will automatically check for updates.

### Start your node at system startup and control it from your OS

IPFS Desktop enables you to stop or restart your node straight from the IPFS logo menu in your OS menubar/system tray. For Mac and Windows users, IPFS Desktop can be also be set to launch at system startup, ensuring that your node is running whenever your computer is on.

### Quickly import files, folders, and screenshots to IPFS

Import files and folders to your IPFS node in a variety of convenient ways:
- Drag and drop items onto IPFS Desktop's `Files` screen
- Click the `Import` button on the `Files` screen to add items from your computer or an IPFS [content ID (CID)](https://docs.ipfs.io/concepts/content-addressing/#identifier-formats)
- (Windows) Right-click a file/folder's icon to add it to IPFS from the pop-up menu
- (Mac) Drag and drop a file/folder onto the IPFS logo in your menubar

Plus, you can use the `Take Screenshot` command under the IPFS logo menu to take a screenshot, import it to your node, and copy a shareable link to your clipboard with one click.

### Easily manage the contents of your node

IPFS Desktop's `Files` screen gives you an easy, familiar interface for working with the contents of your node:
- Easily rename, move, or remove files and folders
- Preview many common file formats directly in IPFS Desktop
- Copy a file/folder's IPFS [content ID (CID)](https://docs.ipfs.io/concepts/content-addressing/#identifier-formats) or a shareable link to your clipboard
- ["Pin"](https://docs.ipfs.io/concepts/persistence/) files to your IPFS node or (coming soon!) to a third-party pinning service

### Quick download for CIDs, IPFS paths, and IPNS paths

Just want to download an IPFS content ID or IPFS/IPNS content path? Choose `Download...` from the IPFS logo menu, paste it in, and you're good to go.

### Visualize your IPFS peers worldwide

Visit the `Peers` screen to see what nodes you're connected to, where they are, the connections they're using, and more.

### Explore the "Merkle Forest" of IPFS files

Use the `Explore` screen to explore some example datasets — or your own files — and see firsthand how items stored on IPFS are broken down into content-addressed pieces.

### Enjoy OS-wide support for IPFS files and links

IPFS Desktop enables most operating systems (Mac, Windows and some Linux flavors) to support protocols including `ipfs://` and `ipns://`. This means that if an app on your computer tries to open a link starting with one of those protocol identifiers (for example, if your web browser encounters a link to `ipns://en.wikipedia-on-ipfs.org`), it'll automatically open in IPFS Desktop.

For an even better experience with `ipfs://`, and `ipns://` addresses, we also recommend installing [IPFS Companion](https://github.com/ipfs-shipyard/ipfs-companion) to add support in your favorite browser!

### Learn IPFS commands as you go

If you're interested in learning how to use IPFS from the command line, IPFS Desktop's CLI Tutor Mode can show you common IPFS commands as you go. Just check the `CLI Tutor Mode` box on the `Settings` screen to switch on this feature.

## Install

Release notes and older versions of IPFS Desktop can be found on the [releases page](https://github.com/ipfs-shipyard/ipfs-desktop/releases).

Don't see your favorite package manager? Visit our [package managers page](https://github.com/ipfs-shipyard/ipfs-desktop/issues/691) and help us add support for it!

### Mac
- **Installer:** [IPFS-Desktop-0.15.0.dmg](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.15.0/IPFS-Desktop-0.15.0.dmg)\
[![](https://img.shields.io/github/downloads/ipfs-shipyard/ipfs-desktop/v0.15.0/IPFS-Desktop-0.15.0.dmg.svg?style=flat-square&label=downloads)](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.15.0/IPFS-Desktop-0.15.0.dmg)
- **Homebrew** (community-maintained): `brew install --cask ipfs`

### Windows
- **Installer:** [IPFS-Desktop-Setup-0.15.0.exe](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.15.0/IPFS-Desktop-Setup-0.15.0.exe)\
[![](https://img.shields.io/github/downloads/ipfs-shipyard/ipfs-desktop/v0.15.0/IPFS-Desktop-Setup-0.15.0.exe.svg?style=flat-square&label=downloads)](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.15.0/IPFS-Desktop-Setup-0.15.0.exe)
- **Chocolatey** (community-maintained): `choco install ipfs-desktop`
- **Scoop** (community-maintained): `scoop bucket add extras; scoop install extras/ipfs-desktop`

### Linux/FreeBSD
- **Tarball** (experimental): [ipfs-desktop-0.15.0-linux-x64.tar.xz](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.15.0/ipfs-desktop-0.15.0-linux-x64.tar.xz)\
[![](https://img.shields.io/github/downloads/ipfs-shipyard/ipfs-desktop/v0.15.0/ipfs-desktop-0.15.0-linux-x64.tar.xz.svg?style=flat-square&label=downloads)](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.15.0/ipfs-desktop-0.15.0-linux-x64.tar.xz)
- **Debian** (experimental): [ipfs-desktop-0.15.0-linux-amd64.deb](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.15.0/ipfs-desktop-0.15.0-linux-amd64.deb)\
[![](https://img.shields.io/github/downloads/ipfs-shipyard/ipfs-desktop/v0.15.0/ipfs-desktop-0.15.0-linux-amd64.deb.svg?style=flat-square&label=downloads)](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.15.0/ipfs-desktop-0.15.0-linux-amd64.deb)
- **Red Hat** (experimental): [ipfs-desktop-0.15.0-linux-x86_64.rpm](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.15.0/ipfs-desktop-0.15.0-linux-x86_64.rpm)\
[![](https://img.shields.io/github/downloads/ipfs-shipyard/ipfs-desktop/v0.15.0/ipfs-desktop-0.15.0-linux-x86_64.rpm.svg?style=flat-square&label=downloads)](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.15.0/ipfs-desktop-0.15.0-linux-x86_64.rpm)
- **AppImage** (experimental): [ipfs-desktop-0.15.0-linux-x86_64.AppImage](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.15.0/ipfs-desktop-0.15.0-linux-x86_64.AppImage)\
[![](https://img.shields.io/github/downloads/ipfs-shipyard/ipfs-desktop/v0.15.0/ipfs-desktop-0.15.0-linux-x86_64.AppImage.svg?style=flat-square&label=downloads)](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.15.0/ipfs-desktop-0.15.0-linux-x86_64.AppImage)
- **FreeBSD** (experimental): [ipfs-desktop-0.15.0-linux-x64.freebsd](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.15.0/ipfs-desktop-0.15.0-linux-x64.freebsd)\
[![](https://img.shields.io/github/downloads/ipfs-shipyard/ipfs-desktop/v0.15.0/ipfs-desktop-0.15.0-linux-x64.freebsd.svg?style=flat-square&label=downloads)](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.15.0/ipfs-desktop-0.15.0-linux-x64.freebsd)
- **Snapcraft** (community-maintained, YMMV): `snap install ipfs-desktop`
- **AUR** (maintained by [@alexhenrie](https://github.com/alexhenrie)): Use the [`ipfs-desktop` package](https://aur.archlinux.org/packages/ipfs-desktop/) 

### Install from source

To install and run IPFS Desktop from source, you'll also need:
- [Node.js](https://nodejs.org/en/) `>=12` 
- [npm](npmjs.org) `>=6.1.0` 
- Any [platform-specific dependencies](https://github.com/nodejs/node-gyp#installation) required by [`node-gyp`](https://github.com/nodejs/node-gyp)

Then, follow the steps below to clone the source code, install dependencies, and run the app.

```bash
git clone https://github.com/ipfs-shipyard/ipfs-desktop.git
cd ipfs-desktop
npm ci
npm run build
npm start
```

## Contribute

We welcome all contributions to IPFS Desktop! The best way to get started is to check the current [open issues](https://github.com/ipfs-shipyard/ipfs-desktop/issues) (or drill down specifically for [issues labeled "help wanted"](https://github.com/ipfs-shipyard/ipfs-desktop/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)) and find something interesting. All issues are categorized by the [standard label taxonomy](https://github.com/ipfs/community/blob/master/ISSUE_LABELS.md) used across the IPFS project, so you can also drill by topic (for example, [UX-related issues](https://github.com/ipfs-shipyard/ipfs-desktop/issues?q=is%3Aissue+is%3Aopen+label%3Atopic%2Fdesign-ux)).

No matter how you contribute, please be sure you read and follow the [IPFS Contributing Guidelines](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md) and the [IPFS Community Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

### Translations

Contributing translations in your language is particularly valuable! We use Transifex to manage internationalization, which means you don't need to change a single line of code to add your translations — just sign up for a Transifex account.

Because IPFS Desktop app includes text from [IPFS Web UI](https://github.com/ipfs-shipyard/ipfs-webui) and [IPLD Explorer](https://github.com/ipfs-shipyard/ipld-explorer), you'll want to join all three Transifex projects in order to see all the text:
- https://www.transifex.com/ipfs/ipfs-desktop/
- https://www.transifex.com/ipfs/ipfs-webui/
- https://www.transifex.com/ipfs/ipld-explorer/

*Note for developers: We use English as our source of truth. This means that if you add any new text, make those additions in [`./assets/locales/en.json`](./assets/locales/en.json) and they will automatically propagate in Transifex for other languages.*

### Developer notes

For more detailed information about hacking on IPFS Desktop, including a release checklist, please see the full [developer notes](DEVELOPER-NOTES.md).

## FAQ & Troubleshooting

### Why am I missing the system tray menu on Linux?

IPFS Desktop is built using Electron, and unfortunately, poor system tray support has been a [longstanding problem with Electron apps](https://github.com/electron/electron/issues/21445).  

You may wish to try troubleshooting according to the [Electron v9.3.0 docs](https://github.com/electron/electron/blob/v9.3.0/docs/api/tray.md#class-tray):

- On Linux, the app indicator will be used if it is supported; otherwise `GtkStatusIcon` will be used
- On Linux distributions that only have app indicator support, you must install `libappindicator1` to make the tray icon work

If you've noticed that the old system tray is back in IPFS Desktop v0.13, this is because the Electron team [removed support for `StatusNotifier` and restored the old tray interface on Linux called `XEmbed`](https://github.com/electron/electron/issues/21445#issuecomment-634163402).

### Why can't I start IPFS Desktop under Debian 10?

Some Linux users may see one of the following errors when trying to launch IPFS Desktop:

When launching by double-clicking the app icon:
> The SUID sandbox helper binary was found, but is not configured correctly.
Rather than run without sandboxing I'm aborting now. You need to make sure that
chrome-sandbox is owned by root and has mode 4755.

When launching from the terminal:
```console
$ ipfs-desktop
$Trace/breakpoint trap
```

This is a known issue with Electron/Chrome and some hardened kernels. More details can be found [here](https://github.com/ipfs-shipyard/ipfs-desktop/issues/1362#issuecomment-596857282), but a fix is to start IPFS Desktop from the terminal with the following additional parameter:
```console
$ ipfs-desktop --no-sandbox
```

### Where are my IPFS configuration and log files?

You can open these files from the IPFS logo menu by selecting `Open Logs Directory` or `Open Configuration File` from the `Advanced` submenu. Or, find them in your OS as follows:
- **Mac:** `~/Library/Application Support/IPFS Desktop/`
- **Windows:** `%appdata%/IPFS Desktop/`
- **Linux:** `~/.config/IPFS Desktop/`

### How does IPFS Desktop select the IPFS repo location?

IPFS Desktop uses [ipfsd-ctl](https://github.com/ipfs/js-ipfsd-ctl), which, by default, checks the `IPFS_PATH` environment variable. If that isn't set, it falls back to `$HOME/.ipfs`. As soon as the first run has succeded, repository location info is saved in the configuration file, which becomes the source of truth.

To open your repo directory from the IPFS logo menu, select `Open Repository Directory` from the `Advanced` submenu.

### Which version of IPFS does IPFS Desktop use?

IPFS Desktop includes its own embedded binary (with version defined in `package.json`); this is the latest version of [go-ipfs](https://github.com/ipfs/go-ipfs) that has passed QA for IPFS Desktop use.

You can check which version of IPFS you're running from the IPFS logo menu by looking in the `About` submenu.

### Which flags does IPFS Desktop boot with?

By default, IPFS Desktop starts the IPFS daemon with the flags `--migrate=true --routing=dhtclient ----enable-gc=true`. 

You can change this in the IPFS Desktop config file by selecting `Open Configuration File` from the `Advanced` submenu.

### I need more help!

If you need help with using IPFS Desktop, the quickest way to get answers is to post them in the [official IPFS forums](https://discuss.ipfs.io). 

If you think you've found a bug or other issue with IPFS Desktop itself, please [open an issue](https://github.com/ipfs-shipyard/ipfs-desktop/issues/new/choose).

## License

[MIT — Protocol Labs, Inc.](./LICENSE)
