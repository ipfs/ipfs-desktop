import { app } from 'electron'

export default async function (fn) {
  if (app.dock) app.dock.show()
  await fn()
  if (app.dock) app.dock.hide()
}
