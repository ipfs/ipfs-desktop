import { ipcMain } from 'electron'
import { launchWebUI } from '../utils'

export default function () {
  ipcMain.on('launch-webui', (event, opts) => {
    launchWebUI(opts)
  })
}
