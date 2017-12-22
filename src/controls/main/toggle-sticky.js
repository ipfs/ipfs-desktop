import {ipcMain} from 'electron'

let sticky = false

export default function (opts) {
  let {menubar, send} = opts

  ipcMain.on('toggle-sticky', () => {
    sticky = !sticky
    menubar.window.setAlwaysOnTop(sticky)
    menubar.setOption('alwaysOnTop', sticky)
    send('sticky-window', sticky)
  })
}
