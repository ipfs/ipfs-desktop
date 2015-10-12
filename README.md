# IPFS Native Application

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io) [![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/) [![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/ipfs/electron-app)

[![Build Status](https://img.shields.io/travis/ipfs/electron-app/master.svg?style=flat-square)](https://travis-ci.org/ipfs/electron-app) [![Dependency Status](https://img.shields.io/david/ipfs/electron-app.svg?style=flat-square)](https://david-dm.org/ipfs/electron-app) [![devDependency Status](https://img.shields.io/david/dev/ipfs/electron-app.svg?style=flat-square)](https://david-dm.org/ipfs/electron-app#info=devDependencies)

> A Native Application for your OS to run your own IPFS Node. Built with [Electron](http://electron.atom.io/).

## Development

## Setup

You will need [Node.js](https://nodejs.org/en/) installed. Preferrably a version `>=4.0`. Also you will need [npm](npmjs.org). After that you should run

```bash
$ git clone git@github.com:ipfs/electron-app.git
$ cd electron-app
$ npm install
$ npm start
```

This launches the app and runs it in your menu bar. Click the IPFS icon to open a console. For example (in OSX):

![](https://ipfs.io/ipfs/QmaufMhYVWPKwhC1jSb4qHBxgiahrq9ct2hgqk5cZxeE7s)

## Tasks

```bash
$ npm run clean         # Clean the build directory
$ npm run start         # Start a development instance
$ npm run lint          # Run linting on all files
$ npm run dist          # Create a package for the current platform
$ npm run dist-all      # Create a package for all platforms
$ npm run start:prod    # Start a packaged instance
```

## Packaging

Th output will be written to the `dist` folder.

```bash
# Package for your current platform
$ npm run dist
# Package for all platforms
$ npm run dist-all
```
