# IPFS Desktop

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](https://protocol.ai/)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![](https://david-dm.org/ipfs-shipyard/ipfs-desktop.svg?style=flat-square)](https://david-dm.org/ipfs-shipyard/ipfs-desktop)
[![total download count](https://img.shields.io/github/downloads/ipfs-shipyard/ipfs-desktop/total.svg?style=flat-square&label=all%20downloads)](https://github.com/ipfs-shipyard/ipfs-desktop/releases)
[![latest release download count](https://img.shields.io/github/downloads-pre/ipfs-shipyard/ipfs-desktop/v0.13.2/total.svg?style=flat-square)](https://github.com/ipfs-shipyard/ipfs-desktop/releases/tag/v0.13.2)

**IPFS Desktop gives you all the power of [IPFS](https://ipfs.io) in an easy desktop app: a complete IPFS node, plus handy OS menubar/taskbar shortcuts and an all-in-one file manager, peer map, and content explorer.**

Use IPFS Desktop to get acquainted with IPFS without needing to touch the command line — or, if you're already experienced, use the powerful menubar/taskbar shortcuts alongside the command line to make your IPFS workflow faster.

**Download now!** 🎉 📥

- **Mac:** [IPFS-Desktop-0.13.2.dmg](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/IPFS-Desktop-0.13.2.dmg) or `brew cask install ipfs`
- **Windows:** [IPFS-Desktop-Setup-0.13.2.exe](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/IPFS-Desktop-Setup-0.13.2.exe) or `choco install ipfs-desktop`
- **Linux:** See [installation options](#install) below


## Table of Contents

- [IPFS Desktop Features](#ipfs-desktop-features)
- [Install](#install)
- [Contribute](#contribute) (including [translations](#translations))
- [FAQ & Troubleshooting](#faq-troubleshooting)

## IPFS Desktop Features

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
- **Installer:** [IPFS-Desktop-0.13.2.dmg](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/IPFS-Desktop-0.13.2.dmg)  [![](https://img.shields.io/github/downloads-pre/ipfs-shipyard/ipfs-desktop/v0.13.2/IPFS-Desktop-0.13.2.dmg.svg?style=flat-square&label=downloads)](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/IPFS-Desktop-0.13.2.dmg)
- **Homebrew** (community-maintained): `brew cask install ipfs`

### Windows
- **Installer:** [IPFS-Desktop-Setup-0.13.2.exe](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/IPFS-Desktop-Setup-0.13.2.exe) [![](https://img.shields.io/github/downloads-pre/ipfs-shipyard/ipfs-desktop/v0.13.2/IPFS-Desktop-Setup-0.13.2.exe.svg?style=flat-square&label=downloads)](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/IPFS-Desktop-Setup-0.13.2.exe)
- **Chocolatey** (community-maintained): `choco install ipfs-desktop`
- **Scoop** (community-maintained): `scoop install ipfs-desktop`

### Linux/FreeBSD
- **Tarball** (experimental!): [ipfs-desktop-0.13.2-linux-x64.tar.xz](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/ipfs-desktop-0.13.2-linux-x64.tar.xz) [![](https://img.shields.io/github/downloads-pre/ipfs-shipyard/ipfs-desktop/v0.13.2/ipfs-desktop-0.13.2-linux-x64.tar.xz.svg?style=flat-square&label=downloads)](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/ipfs-desktop-0.13.2-linux-x64.tar.xz)
- **Debian DEB** (experimental!): [ipfs-desktop-0.13.2-linux-amd64.deb](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/ipfs-desktop-0.13.2-linux-amd64.deb) [![](https://img.shields.io/github/downloads-pre/ipfs-shipyard/ipfs-desktop/v0.13.2/ipfs-desktop-0.13.2-linux-amd64.deb.svg?style=flat-square&label=downloads)](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/ipfs-desktop-0.13.2-linux-amd64.deb)
- **Red Hat RPM** (experimental!): [ipfs-desktop-0.13.2-linux-x86_64.rpm](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/ipfs-desktop-0.13.2-linux-x86_64.rpm) [![](https://img.shields.io/github/downloads-pre/ipfs-shipyard/ipfs-desktop/v0.13.2/ipfs-desktop-0.13.2-linux-x86_64.rpm.svg?style=flat-square&label=downloads)](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/ipfs-desktop-0.13.2-linux-x86_64.rpm)
- **AppImage** (experimental!): [ipfs-desktop-0.13.2-linux-x86_64.AppImage](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/ipfs-desktop-0.13.2-linux-x86_64.AppImage) [![](https://img.shields.io/github/downloads-pre/ipfs-shipyard/ipfs-desktop/v0.13.2/ipfs-desktop-0.13.2-linux-x86_64.AppImage.svg?style=flat-square&label=downloads)](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/ipfs-desktop-0.13.2-linux-x86_64.AppImage)
- **FreeBSD** (experimental!): [ipfs-desktop-0.13.2-linux-x64.freebsd](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/ipfs-desktop-0.13.2-linux-x64.freebsd) [![](https://img.shields.io/github/downloads-pre/ipfs-shipyard/ipfs-desktop/v0.13.2/ipfs-desktop-0.13.2-linux-x64.freebsd.svg?style=flat-square&label=downloads)](https://github.com/ipfs-shipyard/ipfs-desktop/releases/download/v0.13.2/ipfs-desktop-0.13.2-linux-x64.freebsd)
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

Contributing translations in your language is particularly valuable! The IPFS project as a whole uses Transifex to manage internationalization, which means that you don't need to change any of the code in this repo to add your translations — you just need to sign up for a Transifex account.

Because IPFS Desktop app includes code from [IPFS Web UI](https://github.com/ipfs-shipyard/ipfs-webui) and [IPLD Explorer](https://github.com/ipfs-shipyard/ipld-explorer), you'll want to join all three Transifex projects in order to see all the text in need of translation:
- https://www.transifex.com/ipfs/ipfs-desktop/
- https://www.transifex.com/ipfs/ipfs-webui/
- https://www.transifex.com/ipfs/ipld-explorer/

*Note for developers: We use the English text as the source of truth. This means that if you add any new text, make those additions in [./assets/locales/en.json](./assets/locales/en.json) and they will automatically be added to Transifex for the community to translate.*

### Developer notes

For more detailed information about hacking on IPFS Desktop, including a release checklist, please see the full [DEVELOPER-NOTES.md](developer notes).

## FAQ & Troubleshooting

### Where are my IPFS configuration and log files?

The configuration file and logs are located on:
- Mac: `~/Library/Application Support/IPFS Desktop/`
- Windows: `%appdata%/IPFS Desktop/`
- Linux: `~/.config/IPFS Desktop/`

For quick access to this folders, just right-click on your tray icon and then 'Logs Directory' or 'Configuration File', depending on what you want.

### How does IPFS Dekstop select the IPFS repo location?

We use [ipfsd-ctl](https://github.com/ipfs/js-ipfsd-ctl), which, in default conditions, will check `IPFS_PATH` environment variable. If not set, we fallback to `$HOME/.ipfs`. As soon as the first run has succeded, we save the information about the repository location in the configuration file, which becomes the source of truth.

### Which version of IPFS does IPFS Desktop run?

Since we're using [ipfsd-ctl](https://github.com/ipfs/js-ipfsd-ctl), we have our own embedded IPFS binary. We try to always have the latest version.

### Which flags does IPFS Desktop boot with?

By default we use the flags `--migrate=true --routing=dhtclient ----enable-gc=true` when running the IPFS daemon. They can be changed via the configuration file, which can be easily accessed as mentioned above.

### I don't have a system tray icon on Linux. Why?

Poor tray support is a long running problem with Electron apps: [electron/issues/21445](https://github.com/electron/electron/issues/21445).  

According to [electron/v9.3.0/docs/api/tray.md](https://github.com/electron/electron/blob/v9.3.0/docs/api/tray.md#class-tray):

* On Linux the app indicator will be used if it is supported, otherwise `GtkStatusIcon` will be used instead.
* On Linux distributions that only have app indicator support, you have to install `libappindicator1` to make the tray icon work.

Why the old tray is back since v0.13? We had no control over this: Electron team [removed support for `StatusNotifier` and restored the old tray interface on Linux called `XEmbed`](https://github.com/electron/electron/issues/21445#issuecomment-634163402).

### I can't start IPFS Desktop under Debian 10. Why?

Some Linux users may see an error like this:

> The SUID sandbox helper binary was found, but is not configured correctly.
Rather than run without sandboxing I'm aborting now. You need to make sure that
chrome-sandbox is owned by root and has mode 4755.

or a very short one, when starting in a terminal:

```console
$ ipfs-desktop
$Trace/breakpoint trap
```

This is a known issue with Electron/Chrome and some hardened kernels.
If you are interested in details, read [this](https://github.com/ipfs-shipyard/ipfs-desktop/issues/1362#issuecomment-596857282).

The only reliable way to fix this at the moment is to start the app with additional parameter:

```console
$ ipfs-desktop --no-sandbox
```

## License

[MIT Protocol Labs, Inc.](./LICENSE)
