# IPFS Desktop

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](https://protocol.ai/)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![](https://david-dm.org/ipfs-shipyard/ipfs-desktop.svg?style=flat-square)](https://david-dm.org/ipfs-shipyard/ipfs-desktop)
[![total download count](https://img.shields.io/github/downloads/ipfs-shipyard/ipfs-desktop/total.svg?style=flat-square&label=all%20downloads)](https://github.com/ipfs-shipyard/ipfs-desktop/releases)
[![latest release download count](https://img.shields.io/github/downloads/ipfs-shipyard/ipfs-desktop/v0.13.2/total.svg?style=flat-square)](https://github.com/ipfs-shipyard/ipfs-desktop/releases/tag/v0.13.2)

**IPFS Desktop gives you all the power of [IPFS](https://ipfs.io) in an easy desktop app: a complete IPFS node, plus handy OS menubar/taskbar shortcuts and an all-in-one file manager, peer map, and content explorer.**

Use IPFS Desktop to get acquainted with IPFS without needing to touch the command line — or, if you're already experienced, use the powerful menubar/taskbar shortcuts alongside the command line to make your IPFS workflow faster.

**Install now!** 🎉 📥

- **Mac:** [IPFS-Desktop-0.13.2.dmg](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/IPFS-Desktop-0.13.2.dmg) or `brew cask install ipfs`
- **Windows:** [IPFS-Desktop-Setup-0.13.2.exe](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/IPFS-Desktop-Setup-0.13.2.exe) or `choco install ipfs-desktop`
- **Linux:** See [installation options](#install) below


## Table of Contents

- [Features](#features)
- [Install](#install)
- [Contribute](#contribute) (including [translations](#translations))
- [FAQ & Troubleshooting](#faq--troubleshooting)

## Features

![IPFS Desktop](https://gateway.ipfs.io/ipfs/QmbT2YtuNo17Qaq31FJWRZgRMY4E6N9cdfBwzZTFSHUoBP)

IPFS Desktop allows you to run your IPFS Node on your machine without having to bother with command line tools. With it, you have the power of [Web UI](https://github.com/ipfs-shipyard/ipfs-webui) on tip of your hands plus a handful of shortcuts you can find on settings.

It's based on Web UI running in Electron to add those extra, awesome menu commands.

### IPFS daemon always running

IPFS Desktop's main feature is to allow you to have the IPFS daemon always running in the background. But fear not! If you need to stop it, you can do it just by clicking on 'Stop'.

### Handle `ipfs://`, `ipns://` and `dweb:` links

IPFS Desktop has the capacity to handle protocols at the operating system level; i.e., if an application tries to open a link to either `ipfs://`, `ipns://` or `dweb:`, then the OS will call IPFS Desktop, which will handle the link.

For example, if you come across a link on the Internet whose `href` attribute is `ipns://ipfs.io`, then IPFS Desktop will be able to handle it.

On Windows, an easy way to open a link would be to open the Run window (Win+R), paste the link, and hit Enter. Then, IPFS Desktop handles the rest. The same happens if you try opening the same link in a browser.

### Adds `ipfs` to your system

If you're using macOS or Windows and don't have `ipfs` installed on your system, IPFS Desktop will automatically install it so it is available through the command line. If you're using Linux, or already have `ipfs` installed, you can tell IPFS Desktop to take care of it (and keep it up to date!) by toggling the option on Settings.

### Easy add to IPFS

You can easily add files and folders to IPFS:

- On Windows, you can right click on files to add them to IPFS through IPFS Desktop.
- On macOS, you can drag and drop them to the tray icon.

### Download copied hashes

You can enable, on Settings, a shortcut to download an hash on the keyboard.

### Auto-add screenshots

You can enable, on Settings, a shortcut to take screenshots and add them automatically to IPFS.

## Install

Release notes and older versions of IPFS Desktop can be found on the [releases page](https://github.com/ipfs-shipyard/ipfs-desktop/releases).

Don't see your favorite package manager? Visit our [package managers page](https://github.com/ipfs-shipyard/ipfs-desktop/issues/691) and help us add support for it!

### Mac
- **Installer:** [IPFS-Desktop-0.13.2.dmg](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/IPFS-Desktop-0.13.2.dmg)\
[![](https://img.shields.io/github/downloads/ipfs-shipyard/ipfs-desktop/v0.13.2/IPFS-Desktop-0.13.2.dmg.svg?style=flat-square&label=downloads)](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/IPFS-Desktop-0.13.2.dmg)
- **Homebrew** (community-maintained): `brew cask install ipfs`

### Windows
- **Installer:** [IPFS-Desktop-Setup-0.13.2.exe](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/IPFS-Desktop-Setup-0.13.2.exe)\
[![](https://img.shields.io/github/downloads/ipfs-shipyard/ipfs-desktop/v0.13.2/IPFS-Desktop-Setup-0.13.2.exe.svg?style=flat-square&label=downloads)](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/IPFS-Desktop-Setup-0.13.2.exe)
- **Chocolatey** (community-maintained): `choco install ipfs-desktop`
- **Scoop** (community-maintained): `scoop install ipfs-desktop`

### Linux/FreeBSD
- **Tarball** (experimental): [ipfs-desktop-0.13.2-linux-x64.tar.xz](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/ipfs-desktop-0.13.2-linux-x64.tar.xz)\
[![](https://img.shields.io/github/downloads/ipfs-shipyard/ipfs-desktop/v0.13.2/ipfs-desktop-0.13.2-linux-x64.tar.xz.svg?style=flat-square&label=downloads)](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/ipfs-desktop-0.13.2-linux-x64.tar.xz)
- **Debian** (experimental): [ipfs-desktop-0.13.2-linux-amd64.deb](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/ipfs-desktop-0.13.2-linux-amd64.deb)\
[![](https://img.shields.io/github/downloads/ipfs-shipyard/ipfs-desktop/v0.13.2/ipfs-desktop-0.13.2-linux-amd64.deb.svg?style=flat-square&label=downloads)](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/ipfs-desktop-0.13.2-linux-amd64.deb)
- **Red Hat** (experimental): [ipfs-desktop-0.13.2-linux-x86_64.rpm](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/ipfs-desktop-0.13.2-linux-x86_64.rpm)\
[![](https://img.shields.io/github/downloads/ipfs-shipyard/ipfs-desktop/v0.13.2/ipfs-desktop-0.13.2-linux-x86_64.rpm.svg?style=flat-square&label=downloads)](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/ipfs-desktop-0.13.2-linux-x86_64.rpm)
- **AppImage** (experimental): [ipfs-desktop-0.13.2-linux-x86_64.AppImage](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/ipfs-desktop-0.13.2-linux-x86_64.AppImage)\
[![](https://img.shields.io/github/downloads/ipfs-shipyard/ipfs-desktop/v0.13.2/ipfs-desktop-0.13.2-linux-x86_64.AppImage.svg?style=flat-square&label=downloads)](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/ipfs-desktop-0.13.2-linux-x86_64.AppImage)
- **FreeBSD** (experimental): [ipfs-desktop-0.13.2-linux-x64.freebsd](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/ipfs-desktop-0.13.2-linux-x64.freebsd)\
[![](https://img.shields.io/github/downloads/ipfs-shipyard/ipfs-desktop/v0.13.2/ipfs-desktop-0.13.2-linux-x64.freebsd.svg?style=flat-square&label=downloads)](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/ipfs-desktop-0.13.2-linux-x64.freebsd)
- **Snapcraft** (community-maintained): `snap install ipfs-desktop`
- **AUR** (maintained by [@alexhenrie](https://github.com/alexhenrie)): [`ipfs-desktop` package](https://aur.archlinux.org/packages/ipfs-desktop/) 

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

You may also enjoy taking part in the IPFS GUI & Web Browsers Working Group's biweekly meeting to catch up on the latest plans. This meeting does shift around, so please check the [IPFS Community Calendar](https://calendar.google.com/calendar/embed?src=ipfs.io_eal36ugu5e75s207gfjcu0ae84@group.calendar.google.com&ctz=UTC) for the latest day/time.

No matter how you contribute, please be sure you read and follow the [IPFS Contributing Guidelines](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md) and the [IPFS Community Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

### Translations

Contributing translations in your language is particularly valuable! We use Transifex to manage internationalization, which means you don't need to change any of the code in this repo to add your translations — just sign up for a Transifex account.

Because IPFS Desktop app includes code from [IPFS Web UI](https://github.com/ipfs-shipyard/ipfs-webui) and [IPLD Explorer](https://github.com/ipfs-shipyard/ipld-explorer), you'll want to join all three Transifex projects in order to see all the text:
- https://www.transifex.com/ipfs/ipfs-desktop/
- https://www.transifex.com/ipfs/ipfs-webui/
- https://www.transifex.com/ipfs/ipld-explorer/

*Note for developers: We use English as our source of truth. This means that if you add any new text, make those additions in [./assets/locales/en.json](./assets/locales/en.json) and they will automatically propagate in Transifex for other languages.*

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

You can open these files from the IPFS Desktop menubar/system tray menu by selecting `Open Logs Directory` or `Open Configuration File` from the `Advanced` submenu. Or, find them in your OS as follows:
- **Mac:** `~/Library/Application Support/IPFS Desktop/`
- **Windows:** `%appdata%/IPFS Desktop/`
- **Linux:** `~/.config/IPFS Desktop/`

### How does IPFS Desktop select the IPFS repo location?

IPFS Desktop uses [ipfsd-ctl](https://github.com/ipfs/js-ipfsd-ctl), which, by default, checks the `IPFS_PATH` environment variable. If that isn't set, it falls back to `$HOME/.ipfs`. As soon as the first run has succeded, repository location info is saved in the configuration file, which becomes the source of truth.

To open your repo directory from the IPFS Desktop menubar/system tray menu, select `Open Repository Directory` from the `Advanced` submenu.

### Which version of IPFS does IPFS Desktop use?

Since IPFS Desktop uses [ipfsd-ctl](https://github.com/ipfs/js-ipfsd-ctl), it includes its own embedded IPFS binary, which in most circumstances is the latest version of [go-ipfs](https://github.com/ipfs/go-ipfs).

You can check which version of IPFS you're running from the IPFS Desktop menubar/system tray menu by looking in the `About` submenu.

### Which flags does IPFS Desktop boot with?

By default, IPFS Desktop starts the IPFS daemon with the flags `--migrate=true --routing=dhtclient ----enable-gc=true`. 

You can change this in the config file by editing the `IPFS Config` section of IPFS Desktop's `Settings` screen.

### I need more help!

If you need help with using IPFS Desktop, the quickest way to get answers is to post them in the [official IPFS forums](https://discuss.ipfs.io). 

If you think you've found a bug or other issue with IPFS Desktop itself, please [open an issue](https://github.com/ipfs-shipyard/ipfs-desktop/issues/new/choose).

## License

[MIT Protocol Labs, Inc.](./LICENSE)
