<h1 align="center">
  <a href="https://ipfs.io">IPFS Desktop</a>
</h1>

<h3 align="center">A menubar IPFS application to get you on the Distributed Web!</h3>

<p align="center">
  <a href="http://protocol.ai"><img src="https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square" /></a>
  <a href="http://ipfs.io/"><img src="https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square" /></a>
  <a href="http://webchat.freenode.net/?channels=%23ipfs"><img src="https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square" /></a>
</p>

<p align="center">
  <a href="https://travis-ci.org/ipfs-shipyard/ipfs-desktop"><img src="https://travis-ci.org/ipfs-shipyard/ipfs-desktop.svg?branch=master" /></a>
  <br>
  <a href="https://david-dm.org/ipfs-shipyard/ipfs-desktop"><img src="https://david-dm.org/ipfs-shipyard/ipfs-desktop.svg?style=flat-square" /></a>
  <a href="https://github.com/feross/standard"><img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square"></a>
  <a href="https://github.com/RichardLitt/standard-readme"><img src="https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square" /></a>
  <a href=""><img src="https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square" /></a>
  <a href=""><img src="https://img.shields.io/badge/Node.js-%3E%3D6.0.0-orange.svg?style=flat-square" /></a>
  <br>
</p>

| ![](https://ipfs.io/ipfs/QmPBMMG4HUB1U1kLfwWvr6zQhGMcuvWYtGEFeTqBjG2jxW) | ![](https://ipfs.io/ipfs/QmQKdHbDnEAp7ajW7QNayxsuEWywRNyZaX6VbTzvWnHxex) | ![](https://ipfs.io/ipfs/QmTUS8rRufkXQp7ePRogMFLMxmf6YziYcb8HnDrVCvC2DF)|
|:---:|:---:|:---:|
| Info | Add Files | Pin Hashes |
| ![](https://ipfs.io/ipfs/QmW1SWU1aALf8sqSvEFGUtzK8oqX9BGNA6r4bzS8MPg94B) | <img src="https://ipfs.io/ipfs/QmYo91nuMF6QqRVNJbHjKkdpk4nay1qkjq1ztwxFchtDWU" width="260"> | ![](https://ipfs.io/ipfs/QmS9mHTza1U6CjE1ehnaSxpKw7YDBsY3mvBZdBHVoTMLbm) |
| Peers | Overview | Light Theme | 

## Table of Contents

- [Install pre-compiled version](#install-pre-compiled-version)
- [Install from Source](#install-from-source)
- [Contribute](#contribute)
- [File Structure](#file-structure)
- [Components](#components)

## Install pre-compiled version

`Soon™` you will be able to install it via dist.ipfs.io. In the meanwhile, you can head to the [latest release](https://github.com/ipfs-shipyard/ipfs-desktop/releases/latest) and download the binary for your OS. Just click and install!

## Install from Source

You will need [Node.js](https://nodejs.org/en/) installed, preferrably a version `>=6.0.0`. On macOS you may also need Xcode command line tools, if you haven't already, do so by:

```bash
xcode-select --install
sudo xcode-select --switch /Library/Developer/CommandLineTools
```

Also you will need [npm](npmjs.org) `>=3.0`. After that you should run

```bash
> git clone https://github.com/ipfs-shipyard/ipfs-desktop.git
> cd ipfs-desktop
> npm install
> npm start
```

This launches the app and runs it in your menu bar.

## File Structure

All of the important files of this application are into `src` folder, which can be seen as the following tree:

```
├───controls
├───fonts             Static font files.
├───img               Static image assets.
├───js
│   ├───components
│   │   ├───logic     Reusable and stateful components. They have 'state' to track.
│   │   └───view      Reusable and stateless components. They are written as stateless functional components.
│   |───panes         A pane is a larger component to be used within screens.
|   └───screens       A screen is the everything visible at a given point in time inside a single window.
├───styles            Stylesheets in LESS format.
├───utils             Utilitarian classes and functions.
|───views             HTML view files.
└───index.js          Main entry point of the application.
```

### How to add an new pane

Start by creating a new file inside `./src/js/panes` with the following bootstrap content. For more information about each piece, take a look at the [`Header`](./src/js/components/view/header.js) and [`Footer`](./src/js/components/view/footer.js) components.

```js
import React from 'react'

import Pane from '../components/view/pane'
import Header from '../components/view/header'
import Footer from '../components/view/footer'

export default function MyPane {
    return (
      <Pane>
        <Header title='The title of your pane' />

        <div className='main'>
          <p>The body of your pane</p>
        </div>

        <Footer>
          <p>The footer of your pane</p>
        </Footer>
      </Pane>
    )
  }
}
```

Then, you'll have to import the file and create an entry on `panes` array on [`./src/js/screens/menu.js`](./src/js/components/view/icon.js) with a content similar to this one: 

```
{
  id: 'my-pane-id',       // A simple slug to identify your pane.
  title: 'Title',         // To be shown in the menu.
  icon: 'ipfs'            // A themify icon ID (themify.me/themify-icons)
}
```

Now, you already have your pane created and its menu entry. Although, it you click on it, you'll probably get an error message since you aren't really routing that path to it. On the same file, go to `_getRouteScreen` function, and add a `case` for your pane on the `switch`. The value must be the same as the `id` you put on the menu entry.

## Components

The components are classes exported with CamelCase names. The corresponding files have the associated class name with hyphen-separated-words. So, e.g., `simple-stat.js` exports a class named `SimpleStat`.

### [Stateless Components](./src/js/components/view)

+ [**Button**](./src/js/components/view/button.js) is a simple button with text.
+ [**CheckboxBlock**](./src/js/components/view/checkbox-block.js) is like an `InfoBlock`, but with a checkbox attached to it.
+ [**FileBlock**](./src/js/components/view/file-block.js) is used within a file list to describe a file with a button to copy its link.
+ [**Footer**](./src/js/components/view/footer.js) is the footer of a pane.
+ [**Header**](./src/js/components/view/header.js) is the header of a pane.
+ [**Heartbeat**](./src/js/components/view/heartbeat.js) displays an heartbeat-like animation with the IPFS logo.
+ [**IconButton**](./src/js/components/view/icon-button.js) is a button with an icon inside.
+ [**IconDropdownList**](./src/js/components/view/icon-dropdown-list.js) is a dropdown list with an icon.
+ [**Icon**](./src/js/components/view/icon.js) shows an icon.
+ [**InfoBlock**](./src/js/components/view/info-block.js) shows a block of information (used on node info pane).
+ [**KeyCombo**](./src/js/components/view/key-combo.js) is a key combination.
+ [**Key**](./src/js/components/view/key.js) is a key.
+ [**MenuOption**](./src/js/components/view/menu-option.js) is a menu option to show within a menu bar.
+ [**PinnedHash**](./src/js/components/view/pinned-hash.js) is a pinned hash.

### [Statefull Components](./src/js/components/logic)

+ [**NewPinnedHash**](./src/js/components/view/new-pinned-hash.js) is a new pinned hash form.

## Contribute

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs-shipyard/ipfs-desktop/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

## License

[MIT 2016 Protocol Labs, Inc.](./LICENSE)
