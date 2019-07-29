import { app, BrowserWindow } from 'electron'

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

export default {
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
}
