import i18n from './i18n'
import npmOnIpfs from './npm-on-ipfs'
import languageSelector from './language-selector'
import registerDaemon from './register-daemon'
import registerWebUI from './webui'
import openExternal from './open-external'
import autoLaunch from './auto-launch'
import downloadHash from './download-hash'
import takeScreenshot from './take-screenshot'
import appMenu from './app-menu'
import addToIpfs from './add-to-ipfs'
import autoUpdater from './auto-updater'
import tray from './tray'

export default async function (ctx) {

  await npmOnIpfs(ctx)
  process.exit(0)

  await i18n(ctx)
  await appMenu(ctx)
  await openExternal(ctx)
  await autoUpdater(ctx) // ctx.checkForUpdates
  await registerWebUI(ctx) // ctx.webui, ctx.launchWebUI
  await tray(ctx) // ctx.tray
  await registerDaemon(ctx) // ctx.getIpfsd
  await languageSelector(ctx)
  await addToIpfs(ctx)
  await autoLaunch(ctx)
  await downloadHash(ctx)
  await takeScreenshot(ctx)
  // await npmOnIpfs(ctx)
}
