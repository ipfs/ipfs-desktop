import { ipcMain } from 'electron'
import { launchWebUI } from '../utils'

export default function ({ connManager }) {
  ipcMain.on('launchWebUI', async (_, url) => {
    const apiAddress = await connManager.apiAddress()
    launchWebUI({ url, apiAddress })
  })
}
