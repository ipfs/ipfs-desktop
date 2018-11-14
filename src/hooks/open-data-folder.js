import { ipcMain, shell, app } from 'electron'

export default function () {
  ipcMain.on('open.logs.folder', () => {
    const path = app.getPath('userData')
    shell.openItem(path)
  })
}
