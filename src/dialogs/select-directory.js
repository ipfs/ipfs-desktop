import { app, dialog } from 'electron'

export default function selectDirectory (options = {}) {
  return new Promise(resolve => {
    dialog.showOpenDialog({
      title: 'Select a directory',
      defaultPath: app.getPath('home'),
      properties: [
        'openDirectory',
        'createDirectory'
      ],
      ...options
    }, (res) => {
      if (!res || res.length === 0) {
        resolve(null)
      } else {
        resolve(res[0])
      }
    })
  })
}
