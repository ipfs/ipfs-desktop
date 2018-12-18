import { ipcRenderer } from 'electron'

export default {
  name: 'electron',

  doQuitApp: () => async () => {
    ipcRenderer.send('app.quit')
  },

  doOpenWebUI: (url) => async () => {
    ipcRenderer.send('launchWebUI', url)
  }
}
