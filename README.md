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

⚠ This version is experimental and can change. We're still improving it. If you find a bug, please [report it to us](https://github.com/ipfs-shipyard/ipfs-desktop/issues/new).

## Table of Contents

- [Install](#install)
- [Contribute](#contribute)

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

## Contribute

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs-shipyard/ipfs-desktop/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

## License

[MIT Protocol Labs, Inc.](./LICENSE)
