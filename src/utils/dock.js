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

module.exports = Object.freeze({
  show,
  hide,
  run: async (fn) => {
    show()
    const res = await fn()
    hide()
    return res
  },
  runSync: (fn) => {
    show()
    const res = fn()
    hide()
    return res
  }
})
