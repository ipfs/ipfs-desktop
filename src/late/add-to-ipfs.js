import { app } from 'electron'
import fs from 'fs-extra'
import { addToIpfs } from '../utils'

export default async function (ctx) {
  const handleArgv = async argv => {
    for (const arg of argv.slice(1)) {
      if (await fs.pathExists(arg)) {
        await addToIpfs(ctx, arg)
      }
    }
  }

  // Works for Windows context menu
  app.on('second-instance', (_, argv) => {
    handleArgv(argv)
  })

  // macOS tray drop files
  ctx.tray.on('drop-files', async (_, files) => {
    for (const file of files) {
      await addToIpfs(ctx, file)
    }

    ctx.launchWebUI('/files', { focus: false })
  })

  // Checks current proccess
  if (process.env.NODE_ENV !== 'development') {
    await handleArgv(process.argv)
  } else {
    await handleArgv(process.argv.slice(3))
  }
}
