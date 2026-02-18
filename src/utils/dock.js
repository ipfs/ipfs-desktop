const { app, BrowserWindow } = require('electron')

function show () {
  if (app.dock) app.dock.show()
}

function hide () {
  if (!app.dock) return

  const count = BrowserWindow.getAllWindows()
    .filter(w => w.isVisible())
    .length

  if (count <= 0) {
    app.dock.hide()
  }
}

const run = async (fn) => {
  show()
  const res = await fn()
  hide()
  return res
}

const runSync = (fn) => {
  show()
  const res = fn()
  hide()
  return res
}

module.exports = {
  show,
  hide,
  run,
  runSync
}
