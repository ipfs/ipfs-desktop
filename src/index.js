import setup from './setup'
import start from './start'
import setupErrorHandling from './errors'
import { app, dialog } from 'electron'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

// Ensure it's a single instance.
app.makeSingleInstance(() => {
  dialog.showErrorBox(
    'Multiple instances',
    'Sorry, but there can be only one instance of IPFS Desktop running at the same time.'
  )
})

// Avoid quitting the app when all windows are closed
app.on('window-all-closed', e => e.preventDefault())

setupErrorHandling()

async function run () {
  const ipfsd = await setup()
  start(ipfsd)
}

if (app.isReady()) run()
else app.on('ready', run)
