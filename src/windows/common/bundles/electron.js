import { ipcRenderer } from 'electron'

export default {
  name: 'electron',

  doOpenLogsDir: () => async () => {
    ipcRenderer.send('open.logs.folder')
  },

  doQuitApp: () => async () => {
    ipcRenderer.send('app.quit')
  },

  doOpenWebUI: () => async () => {
    ipcRenderer.send('launchWebUI')
  },

  doOpenSettings: () => async () => {
    ipcRenderer.send('settings.openWindow')
  }
}
