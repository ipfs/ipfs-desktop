'use strict'

var ipc = window.require('remote').require('ipc')

ipc.on('err', function (err) {
  if (err) {
    var error = window.document.getElementById('error')
    error.innerHTML = '<pre>' + err + '</pre>'
  } else {

  }
})
