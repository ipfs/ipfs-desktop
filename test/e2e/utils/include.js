// This file is included before anything else on the tested app.
// It is not compiled beforehand so it needs to use requires.
const tmp = require('tmp')
const { app } = require('electron')
const userData = tmp.dirSync({ prefix: 'tmp_userData_', unsafeCleanup: true })

app.setPath('userData', userData.name)
