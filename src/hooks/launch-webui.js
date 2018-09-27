import { ipcMain } from 'electron'
import { launchWebUI } from '../utils'

export default function ({ connManager }) {
  ipcMain.on('launch-webui', async (event, url) => {
    const apiAddress = await connManager.apiAddress()
    launchWebUI({ url, apiAddress })
  })
}
