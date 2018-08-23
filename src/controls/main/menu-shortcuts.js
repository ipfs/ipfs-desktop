import {Menu} from 'electron'

export default function () {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
      // Edit menu entries so the shortcuts work on macOS
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { role: 'selectall' }
      ]
    },
    {
      // View entries so we can use Dev Tools and Reload
      label: 'View',
      submenu: [
        {role: 'reload'},
        {role: 'forcereload'},
        {role: 'toggledevtools'}
      ]
    }
  ]))
}
