import { ipcRenderer } from 'electron'

export default {
  name: 'electron',

  doOpenWebUI: () => async () => {
    ipcRenderer.send('launchWebUI')
  },

  doOpenLogsDir: () => async () => {
    ipcRenderer.send('open.logs.folder')
  },

  doQuitApp: () => async () => {
    ipcRenderer.send('app.quit')
  }
}
