import {ipcMain} from 'electron'

let sticky = false

export default function (opts) {
  let {menubar, send} = opts

  ipcMain.on('toggle-sticky', () => {
    sticky = !sticky
    menubar.window.setAlwaysOnTop(sticky)
    send('sticky-window', sticky)
  })
}
