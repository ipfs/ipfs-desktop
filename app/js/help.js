'use strict'

var ipc = require('ipc')

// function initialize () {
//   ipc.emit('initialize-node')
// }

ipc.on('err', function (err) {
  if (err) {
    var error = window.document.getElementById('error')
    error.innerHTML = '<pre>' + err + '</pre>'
  } else {

  }
})
