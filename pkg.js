#!/usr/bin/env node

// Taken from https://github.com/chentsulin/electron-react-boilerplate/blob/master/package.js

var os = require('os')
var packager = require('electron-packager')
var assign = require('object-assign')
var del = require('del')
var exec = require('child_process').exec
var argv = require('minimist')(process.argv.slice(2))

// Need to customize this list to avoid issues with missing
// dependencies
var ignoreDeps = [
  'babel',
  'babel-core',
  'babel-eslint',
  'babel-loader',
  'babel-plugin-react-transform',
  'css-loader',
  'electron-debug',
  'electron-packager',
  'electron-prebuilt',
  'eslint',
  'eslint-config-standard',
  'eslint-config-standard-react',
  'eslint-plugin-react',
  'eslint-plugin-standard',
  'express',
  'file-loader',
  'less',
  'less-loader',
  'pre-commit',
  'react-transform-catch-errors',
  'react-transform-hmr',
  'redbox-react',
  'standard',
  'style-loader',
  'webpack',
  'webpack-dev-middleware',
  'webpack-hot-middleware',
  'webpack-target-electron-renderer'
]

var appName = argv.name || argv.n || 'IPFS'
var shouldUseAsar = argv.asar || argv.a || false
var shouldBuildAll = argv.all || false

var DEFAULT_OPTS = {
  dir: './',
  name: appName,
  asar: shouldUseAsar,
  ignore: [
    '/test($|/)',
    '/tools($|/)',
    '/release($|/)',
    '/app.log'
  ].concat(ignoreDeps.map(function (name) {
    return '/node_modules/' + name + '($|/)'
  }))
}

var icon = argv.icon || argv.i || './node_modules/ipfs-logo/platform-icons/ipfs.icns'

if (icon) {
  DEFAULT_OPTS.icon = icon
}

var version = argv.version || argv.v

if (version) {
  DEFAULT_OPTS.version = version
  startPack()
} else {
  // use the same version as the currently-installed electron-prebuilt
  exec('npm list | grep electron-prebuilt', function (err, stdout, stderr) {
    if (err) {
      DEFAULT_OPTS.version = '0.28.3'
    } else {
      DEFAULT_OPTS.version = stdout.split('@')[1].replace(/\s/g, '')
    }
    startPack()
  })
}

function startPack () {
  console.log('start pack...')
  del('release')
    .then(function (paths) {
      if (shouldBuildAll) {
        // build for all platforms
        var archs = ['ia32', 'x64']
        var platforms = ['linux', 'win32', 'darwin']

        platforms.forEach(function (plat) {
          archs.forEach(function (arch) {
            pack(plat, arch, log(plat, arch))
          })
        })
      } else {
        // build for current platform only
        pack(os.platform(), os.arch(), log(os.platform(), os.arch()))
      }
    })
    .catch(function (err) {
      console.error(err)
    })
}

function pack (plat, arch, cb) {
  // there is no darwin ia32 electron
  if (plat === 'darwin' && arch === 'ia32') return

  var opts = assign({}, DEFAULT_OPTS, {
    platform: plat,
    arch: arch,
    out: 'release/' + plat + '-' + arch
  })

  packager(opts, cb)
}

function log (plat, arch) {
  return function (err, filepath) {
    if (err) return console.error(err)
    console.log(plat + '-' + arch + ' finished!')
  }
}
