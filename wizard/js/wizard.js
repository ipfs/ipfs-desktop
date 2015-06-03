var remote = require('remote')
var ipc = require('ipc')

function initialize () {
  ipc.emit('initialize-node')
}

ipc.on('err', function (err) {
  var error = window.document.getElementById('error')
  error.innerHTML = '<pre>' + err + '</pre>'
})

// ipc.on('initialized', function (err) {

// })
