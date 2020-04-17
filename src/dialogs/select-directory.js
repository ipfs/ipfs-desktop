const { app, dialog } = require('electron')

module.exports = async function selectDirectory (options = {}) {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Select a directory',
    defaultPath: app.getPath('home'),
    properties: [
      'openDirectory',
      'createDirectory'
    ],
    ...options
  })

  if (canceled || filePaths.length === 0) {
    return
  }

  return filePaths[0]
}
