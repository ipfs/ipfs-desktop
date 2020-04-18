const { app, dialog } = require('electron')
const i18n = require('i18next')

module.exports = async function selectDirectory (options = {}) {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: i18n.t('selectDirectory'),
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
