import { ipcRenderer } from 'electron'

export default {
  name: 'electron',

  doToggleIpfs: () => async () => {
    ipcRenderer.send('ipfs.toggle')
  },

  doOpenWebUI: (url) => async () => {
    ipcRenderer.send('launchWebUI', url)
  }
}
