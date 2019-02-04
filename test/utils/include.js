require('@babel/register')

const tmp = require('tmp')
const { app } = require('electron')
const userData = tmp.dirSync({ unsafeCleanup: true })

app.setPath('userData', userData.name)
