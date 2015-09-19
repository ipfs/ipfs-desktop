IPFS Native Application
=======================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io) [![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/) [![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs) [![Dependency Status](https://david-dm.org/ipfs/electron-app.svg?style=flat-square)](https://david-dm.org/ipfs/electron-app) [![Build Status](https://img.shields.io/travis/ipfs/electron-app/master.svg?style=flat-square)](https://travis-ci.org/ipfs/electron-app)

> A Native Application for your OS to run your own IPFS Node. Built with Electron Shell

## folder structure

```bash
$ tree app
app
├── controls        # Application controls to interact with the system
├── img
│   ├── loading.gif
│   └── logo.png
├── init.js
├── js              # React/Frontend components
│   ├── help.js
│   ├── menubar.jsx # React view for all the things menu bar
│   ├── toggle.jsx
│   └── welcome.jsx # React component for the welcoming screen for 1st time users
├── styles
│   ├── common.css
│   └── menu.css
└── views
    ├── help.html
    ├── menubar.html
    └── welcome.html
```

# usage

```bash
$ npm i
$ npm start
```

This launches the app and runs it in your menu bar. Click the IPFS icon to open a console. For example (in OSX):

![](https://ipfs.io/ipfs/QmU5AghSAezpYFNyuYZ7gX1zcHCheQndPtBMj1MHr5QpWL/cap.png)

# packaging

will be written to ./dist

### make a package for your system

```bash
npm run dist
```

### make packages for all platforms

```bash
npm run dist-all
```
