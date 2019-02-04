# IPFS Desktop

> A desktop client for [IPFS](https://ipfs.io).
>
> You don't need the command line to run an IPFS node. Just install IPFS Desktop and have all the power of IPFS in your hands. Powered by [Web UI](https://github.com/ipfs-shipyard/ipfs-webui).

![IPFS Desktop](https://user-images.githubusercontent.com/5447088/48506134-a8106d80-e840-11e8-94bf-2108f2354dd1.png)

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](https://protocol.ai/)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![](https://david-dm.org/ipfs-shipyard/ipfs-desktop.svg?style=flat-square)](https://david-dm.org/ipfs-shipyard/ipfs-desktop)

IPFS Desktop allows you to run your IPFS Node on your machine without having to bother with command line tools. With it, you the power of [Web UI](https://github.com/ipfs-shipyard/ipfs-webui) on tip of your hands plus a handful of shortcuts you can find on settings.

> ⚠ Please note that this version is not stable yet and might change. Also, Linux support is still experimental and it might not work on every desktop environment. Please [file an issue](https://github.com/ipfs-shipyard/ipfs-desktop/issues/new) if you find a bug.

## Table of Contents

- [Install](#install)
- [Contribute](#contribute)
    - [Translations](#translations)
- [FAQ](#faq)

## Install

Go to the [*latest release*](https://github.com/ipfs-shipyard/ipfs-desktop/releases/latest) page and download IPFS Desktop for your OS.

### Install from Source

To install it from source you need [Node.js](https://nodejs.org/en/) `>=10.4.0` and
need [npm](npmjs.org) `>=6.1.0` installed. This uses [`node-gyp`](https://github.com/nodejs/node-gyp) so **you must take a look** at their [platform specific dependencies](https://github.com/nodejs/node-gyp#installation).

Then the follow the steps below to clone the source code, install the dependencies and run it the app:

```bash
git clone https://github.com/ipfs-shipyard/ipfs-desktop.git
cd ipfs-desktop
npm install
npm start
```

The IPFS Desktop app will launch and should appear in your OS menu bar.

## Translations

The translations are stored on [./src/locales](./src/locales) and the English version is the source of truth.
Other languages are periodically pulled from [Transifex](https://www.transifex.com/ipfs/ipfs-desktop/), a web interface to help us translate IPFS Desktop and its components to another languages.

## Releasing

- Bump the version in the package.json & run `npm install`
- Commit and push to master
- CI will build installers for macos, win & linux attach them to a new [Draft Release](https://github.com/ipfs-shipyard/ipfs-desktop/releases)
- Iterate on changes till you are happy that the release is ready. CI will update the artefacts attached to the draft release as PRs are merged into master.
- Publish the release. Github will tag master at that point.
- The `latest.yml, latest-mac.yml, latest-linux.yml` files on the release are used by the app to determin when an app update is available. Once a release is published, users should recieve the app update. See: https://www.electron.build/auto-update
- To start work on the next version, bump the version in the package.json and repeat theses steps.

## Contribute

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/#contributing-guidelines)

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs-shipyard/ipfs-desktop/issues)!

If you're interested in contributing translations, go to [project page on Transifex](https://www.transifex.com/ipfs/ipfs-desktop/translate/), create an account, pick a language and start translating.

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

## FAQ

### Where is the configuration and logs?

The configuration file and logs are located on `~/Library/Application Support/IPFS Desktop` on macOS and `%appdata%/ipfs-desktop` on Windows. For quick access to this folders, just right-click on your tray icon and then 'Logs Directory'.

### How do we select the IFPS repo location?

On the first run, we check `IPFS_PATH` environment variable. If not set, we fallback to `$HOME/.ipfs`. From the moment the repository is set up, we save its location on the configuration file and it is the source of truth from now on.

### Which version of IPFS are we running?

Since we're using [ipfsd-ctl](https://github.com/ipfs/js-ipfsd-ctl), we have our own embedded IPFS binary. We try to always have the latest version.

### Which flags do we use to boot IPFS?

By default we use the flags `--migrate=true --routing=dhtclient` when running the IPFS daemon. They can be changed via the configuration file, which can be easily accessed through a right-click.

## License

[MIT Protocol Labs, Inc.](./LICENSE)
