// This file is included before anything else on the tested app.
// It is not compiled beforehand so it needs to use requires.
require('@babel/register')

const tmp = require('tmp')
const { app } = require('electron')
const userData = tmp.dirSync({ unsafeCleanup: true })

app.setPath('userData', userData.name)
