import settingsWindow from './settings'
import menubarWindow from './menubar'

export default async function (opts) {
  await settingsWindow(opts)
  await menubarWindow(opts)
}
