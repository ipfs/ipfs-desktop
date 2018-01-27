/* eslint-env mocha */

import {expect} from 'chai'
import {Application} from 'spectron'
import path from 'path'
import {exec} from 'child_process'

const electron = path.resolve(__dirname, '../node_modules/.bin/electron')
const electronCompile = path.resolve(__dirname, '../node_modules/.bin/electron-compile')

describe('Application Launch', function () {
  this.timeout(2 * 60 * 1000)
  let app

  beforeEach(() => new Promise((resolve, reject) => {
    console.log('sart compiling')
    exec(`${electronCompile} ${path.resolve(__dirname, '../')}`, () => {
      console.log('compiled')
      app = new Application({
        path: electron,
        args: [path.join(__dirname, '../src/index.js')]
      })
      console.log('app')
      app.start().then(resolve)
    })
  }))

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop()
    }
  })

  it('opens a window', () => {
    return app.client.waitUntilWindowLoaded()
  })
})
